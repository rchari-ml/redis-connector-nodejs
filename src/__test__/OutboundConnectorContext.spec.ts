
import { ConnectorRequest } from "../dto/ConnectorRequest"
import {Secret, OutboundConnector, OutboundConnectorFunction, OutboundConnectorContext, NotNull} from '../index'

@OutboundConnector({
    name : "RedisConnectorNodeJS", 
    type : "io.camunda:redis-connector-nodejs:1",
    inputVariables : [ "hostname", "port", "user", "token", "operationType", "key" ]    
})
class MyFunction implements OutboundConnectorFunction {
    execute(context: OutboundConnectorContext) {
        const vars = context.getVariablesAsType(ConnectorRequest)
        context.validate(vars)
        context.replaceSecrets(vars)
        return { vars }
    }
}

var dotenv = require("dotenv").config( {  } );
const __H__ = process.env.REDIS_HOSTNAME   ? process.env.REDIS_HOSTNAME : "something-is-fishy-h";
const __P__ = process.env.REDIS_PORT       ? process.env.REDIS_PORT     : "something-is-fishy-p";
const __U__ = process.env.REDIS_USER       ? process.env.REDIS_USER     : "something-is-fishy-u";
const __S__ = process.env.REDIS_SECRET     ? process.env.REDIS_SECRET   : "something-is-fishy-s";

test('OutboundConnectorContext.validate will throw if a required variable is missing', () => {
    
    const context = new OutboundConnectorContext({});

    context.setVariables(
                {   
                    hostname: __H__,
                    port: __P__,
                    user: __U__,
                    token: __S__, 
                    operationType: "", 
                    key: "name"
                } );
    const v = context.getVariablesAsType(ConnectorRequest)
    context.replaceSecrets(v)

    let err: string = ""
    try {
        context.validate(v)
    } catch (e: any) {
        err = e.message
    }
    expect(err).toEqual(`Missing required variables: ["operationType\"]`)
    
})


test('OutboundConnectorContext.replaceSecrets replaces secrets from environment by default', () => {
    
    const context = new OutboundConnectorContext({ });
    
    context.setVariables(
                {   
                        hostname: __H__,
                        port: __P__,
                        user: __U__,
                        token: "secrets.REDIS_SECRET" ,
                        operationType: "GET", 
                        key: "name"                        
                } );
    const v = context.getVariablesAsType(ConnectorRequest)
    context.replaceSecrets(v)

    expect(v.token).toEqual("ask-me-for-this")
    
})

