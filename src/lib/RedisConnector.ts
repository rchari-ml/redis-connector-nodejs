import { OutboundConnector, OutboundConnectorContext, OutboundConnectorFunction } from "camunda-connector-sdk"
import { ConnectorRequest } from "../dto/ConnectorRequest"
import { createClient } from "redis";
require('dotenv').config();


@OutboundConnector( { 
    name : "RedisConnectorNodeJS", 
    type : "io.camunda:redis-connector-nodejs:1",
    inputVariables : [ "hostname", "port", "user", "token", "operationType", "key" ]
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

            return await this.invokeGetOperation( c, req );

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

}