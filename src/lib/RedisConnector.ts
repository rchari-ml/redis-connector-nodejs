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

    constructor() {
        console.log("Outbound Connector - constructor");
    }

    public async getRedisClient( urlString : string )  {        

        this.redisClient = await createClient( { url : urlString } )
                        .on('error',        err => { console.log('Ten20 Redis - connection error seen - ' + err); throw new Error('Ten20 Redis - connection error seen - ' + err); }    )
                        .on('connect',      ()  => console.log('Ten20 Redis - successfully connected'+'\n')        )
                        .on('reconnecting', ()  => console.log('Ten20 Redis - client reconnecting')                )
                        .on('ready',        ()  => console.log('Ten20 Redis - client is ready to serve requests' ) )
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
            
            console.log('makeCall - get redis client');
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
            console.log('makeCall - connection related error ', e);
            return { 
                status  : 'error',
                message : 'Runtime error while creating connection with req params ' + e,
                data    : {}
            }            
        }
        finally{
            console.log('makeCall - release redis client resource');
            if (c !== null) await c.disconnect();
            c = null;
        }           
    }
    
   async invokeGetOperation( conn : any, req : ConnectorRequest ) {
        
            let m = null; //  message output

            try {

                console.log('Invoke get operation - invoke json get api operation');
                m = await conn
                .json
                .get(  req.key, { path: '.'} )
                .then( ( output : any) => {
    
                        // format output data and return 
                        console.log('Invoke get operation - validate api response');
                        if (  output != null) {
                            console.log('Invoke get operation - return data with success');
                            return { 
                                status  : 'success',
                                message : 'success',
                                data    : output
                            };
                        }
                        else {
                            console.log('Invoke get operation - return nodata');
                            return { 
                                status  : 'nodata',
                                message : 'nodata for the given key',
                                data    : {}
                            };
                        }
                    })

                    console.log(m); return m;
            } 
            catch(err : any) {
                console.log('Invoke get operation - return error');
                return { 
                    status  : 'error',
                    message : 'Runtime error while retrieving data ' + err,
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

            console.log('Invoke put operation - invoke json put api operation to create new record');
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
                    console.log('Invoke put operation - validate api response');
                    if (  output != null) {
                        console.log('Invoke put operation - return data with success');
                        return { 
                            status  : 'success',
                            message : 'success',
                            data    : output
                        };
                    }
                    else {
                        console.log('Invoke put operation - api call returned null - try updating existing record');
                        return { 
                            status  : 'exists',
                            message : 'api call returned null value',
                            data    : {}
                        };
                    }
                });

                if ( m.status === 'exists' ){
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
                                console.log('Invoke put operation - validate api response');
                                if (  output != null) {
                                    console.log('Invoke put operation - return data with success');
                                    return { 
                                        status  : 'success',
                                        message : 'success',
                                        data    : output
                                    };
                                }
                                else {
                                    console.log('Invoke put operation - api call returned null - send back as is');
                                    return { 
                                        status  : 'success',
                                        message : 'api call XX:true returned null value',
                                        data    : {}
                                    };
                                }
                            })                
                } // end of check for updating existing record

                return m;
        } 
        catch(err : any) {
            console.log('Invoke put operation - return error');
            return { 
                status  : 'error',
                message : 'Runtime error while writing data ' + err,
                data    : {}
            };
        }
    } // end of put method definition

    async invokeDeleteOperation( conn : any, req : ConnectorRequest ) {
        
        let m = null; //  message output

        try {

            console.log('Invoke del operation - invoke json api operation');
            m = await conn
            .json
            .del(  req.key )
            .then( ( output : any) => {

                    // format output data and return 
                    console.log('Invoke del operation - validate api response');
                    if (  output != null) {
                        console.log('Invoke del operation - return data with success');
                        return { 
                            status  : 'success',
                            message : 'success',
                            data    : output
                        };
                    }
                    else {
                        console.log('Invoke del operation - api returned null response');
                        return { 
                            status  : 'nodata',
                            message : 'nodata for the given key',
                            data    : {}
                        };
                    }
                })

                console.log(m); return m;
        } 
        catch(err : any) {
            console.log('Invoke del operation - return error');
            return { 
                status  : 'error',
                message : 'Runtime error while handling del operation ' + err,
                data    : {}
            };
        }

    } // end of method

}