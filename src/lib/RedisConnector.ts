import { OutboundConnector, OutboundConnectorContext, OutboundConnectorFunction } from "camunda-connector-sdk"
import { ConnectorRequest } from "../dto/ConnectorRequest"
import { createClient } from "redis";
require('dotenv').config();


@OutboundConnector( { 
    name : "RedisConnectorNodeJS", 
    type : "io.camunda:redis-connector-nodejs:1",
    inputVariables : [ "hostname", "port", "user", "token", "operationType", "key", "data" ]
} )
export class Connector implements OutboundConnectorFunction {

    // Redis related stuff goes here
    redisClient : any;

    static readonly STATUS_SUCCESS : string = 'success';
    static readonly STATUS_ERROR   : string = 'error';
    static readonly STATUS_NODATA  : string = 'nodata';
    static readonly STATUS_EXISTS  : string = 'exists';

    static readonly MESSAGE_SUCCESS : string = 'success';
    static readonly MESSAGE_METHOD_LEVEL_ERROR  : string = 'Runtime error while handling operation ';            
    static readonly C1 = 'Invoke operation - ';
    static readonly LOG_IN_METHOD_GET           : string = Connector.C1 + 'get ';
    static readonly LOG_IN_METHOD_PUT           : string = Connector.C1 + 'put ';
    static readonly LOG_IN_METHOD_DELETE        : string = Connector.C1 + 'del ';
    static readonly LOG_IN_METHOD_CONN_HANDLER  : string = 'Ten20 Redis - client ';
    static readonly LOG_IN_METHOD_MAKE_CALL     : string = Connector.C1 + 'makeCall ';

    constructor() {
        console.log("Outbound Connector - constructor");
    }

    public async getRedisClient( urlString : string )  {        

        this.redisClient = await createClient( { url : urlString } )
                        .on('error',        err => { console.log(Connector.LOG_IN_METHOD_CONN_HANDLER + 'connection error seen - ' + err); throw new Error('Ten20 Redis - connection error seen - ' + err); }    )
                        .on('connect',      ()  =>   console.log(Connector.LOG_IN_METHOD_CONN_HANDLER + 'successfully connected'+'\n')        )
                        .on('reconnecting', ()  =>   console.log(Connector.LOG_IN_METHOD_CONN_HANDLER + 'reconnecting')                )
                        .on('ready',        ()  =>   console.log(Connector.LOG_IN_METHOD_CONN_HANDLER + 'is ready to serve requests' ) )
                        .connect();

        return this.redisClient
    }


    public init(  ) {
        console.log("Outbound Connector - init()");
        
    }

    async execute(context: OutboundConnectorContext) {
        const req = context.getVariablesAsType(ConnectorRequest)
        context.replaceSecrets(req)
        return this.makeCall(req)
    }

    async makeCall(req: ConnectorRequest) {

        let c = null;
        try {
            // do the connection related handling here
            const baseUrl = `redis://`
            const urlString = `${baseUrl}${req.user}:${req.token}@${req.hostname}:${req.port}`                
            
            console.log(Connector.LOG_IN_METHOD_MAKE_CALL + 'get redis client');
            c = await this.getRedisClient( urlString );

            switch ( req.operationType ){
                case 'GET': 
                            return await this.invokeGetOperation( c, req );

                case 'PUT':
                            return await this.invokePutOperation( c, req );

                case 'DELETE':
                            return await this.invokeDeleteOperation( c, req );
            }

        } catch( e : any ){
            console.log(Connector.LOG_IN_METHOD_MAKE_CALL + 'connection related error ', e);
            return { 
                status  : Connector.STATUS_ERROR,
                message : 'Runtime error while creating connection with req params ' + e,
                data    : {}
            }            
        }
        finally{
            console.log(Connector.LOG_IN_METHOD_MAKE_CALL + 'release redis client resource');
            if (c !== null) await c.disconnect();
            c = null;
        }           
    }
    
   async invokeGetOperation( conn : any, req : ConnectorRequest ) {
        
            let m = null; //  message output

            try {

                console.log(Connector.LOG_IN_METHOD_GET + 'invoke json get api operation');
                m = await conn
                .json
                .get(  req.key, { path: '.'} )
                .then( ( output : any) => {
    
                        // format output data and return 
                        if (  output != null) {

                            return { 
                                status  : Connector.STATUS_SUCCESS,
                                message : Connector.MESSAGE_SUCCESS,
                                data    : output
                            };
                        }
                        else {
                            console.log(Connector.LOG_IN_METHOD_GET + 'return nodata');
                            return { 
                                status  : Connector.STATUS_NODATA,
                                message : 'nodata for the given key',
                                data    : {}
                            };
                        }
                    })

                    console.log(m); return m;
            } 
            catch(err : any) {
                console.log(Connector.LOG_IN_METHOD_GET + 'return error');
                return { 
                    status  : Connector.STATUS_ERROR,
                    message : Connector.MESSAGE_METHOD_LEVEL_ERROR + ' get ' + err,
                    data    : {}
                };
            }

    } // end of method

    async invokePutOperation( conn : any, req : ConnectorRequest ) {

        let data = null, expiry = null; //  message to write to the db with optional expiry
        let m = null;    //  response message 
        const C_VALUE_PATH_ROOT = "$";

        try {
            data = (req.data === null || req.data === '') ? JSON.parse('{}') : JSON.parse(req.data); 

            console.log( 'invoke json put api operation to create new record');
            m = await conn
            .json
            .set(   req.key, 
                    C_VALUE_PATH_ROOT ,
                    data,
                    {   "NX" : true, // create only new records. if key already exists, then api returns null.
                        "EX" :  -1
                    } 
                )
            .then( ( output : any) => {

                    // format output data and return 
                    if (  output != null) {
                        return { 
                            status  : Connector.STATUS_SUCCESS,
                            message : Connector.MESSAGE_SUCCESS,
                            data    : output
                        };
                    }
                    else {
                        console.log(Connector.LOG_IN_METHOD_PUT + 'api call returned null - try updating existing record');
                        return { 
                            status  : Connector.STATUS_EXISTS,
                            message : 'api call returned null value',
                            data    : {}
                        };
                    }
                });

                if ( m.status === Connector.STATUS_EXISTS ){
                        // hmm lets update existing record
                        m = await conn
                        .json
                        .set(   req.key, 
                                C_VALUE_PATH_ROOT,
                                data,
                                {   "XX" : true, // update existing record.
                                    "EX" :  -1
                                }
                            )
                        .then( ( output : any) => {
            
                                // format output data and return 
                                if (  output != null) {
                                    return { 
                                        status  : Connector.STATUS_SUCCESS,
                                        message : Connector.MESSAGE_SUCCESS,
                                        data    : output
                                    };
                                }
                                else {
                                    console.log(Connector.LOG_IN_METHOD_PUT + 'api call returned null - send back as is');
                                    return { 
                                        status  : Connector.STATUS_SUCCESS,
                                        message : 'api call XX:true returned null value',
                                        data    : {}
                                    };
                                }
                            })                
                } // end of check for updating existing record

                return m;
        } 
        catch(err : any) {
            console.log(Connector.LOG_IN_METHOD_PUT + 'return error');
            return { 
                status  : Connector.STATUS_ERROR,
                message : Connector.MESSAGE_METHOD_LEVEL_ERROR + ' put ' + err,
                data    : {}
            };
        }
    } // end of put method definition

    async invokeDeleteOperation( conn : any, req : ConnectorRequest ) {
        
        let m = null; //  message output

        try {

            m = await conn
            .json
            .del(  req.key )
            .then( ( output : any) => {

                    // format output data and return 
                    if (  output != null) {

                        return { 
                            status  : Connector.STATUS_SUCCESS,
                            message : Connector.MESSAGE_SUCCESS,
                            data    : output
                        };
                    }
                    else {
                        console.log(Connector.LOG_IN_METHOD_DELETE + 'api returned null response');
                        return { 
                            status  : Connector.STATUS_NODATA,
                            message : 'nodata for the given key',
                            data    : {}
                        };
                    }
                })

                console.log(m); return m;
        } 
        catch(err : any) {
            console.log(Connector.LOG_IN_METHOD_DELETE + 'return error');
            return { 
                status  : Connector.STATUS_ERROR,
                message : Connector.MESSAGE_METHOD_LEVEL_ERROR + ' del ' + err,
                data    : {}
            };
        }

    } // end of method

}