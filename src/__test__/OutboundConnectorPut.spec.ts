
import { ConnectorRequest } from "../dto/ConnectorRequest"
import { OutboundConnectorContext } from "camunda-connector-sdk"
import { getOutboundConnectorDescription } from '../outbound'
import { Connector } from '../lib/RedisConnector'

var dotenv = require("dotenv").config( {  } );
const __H__ = process.env.REDIS_HOSTNAME   ? process.env.REDIS_HOSTNAME : "something-is-fishy-h";
const __P__ = process.env.REDIS_PORT       ? process.env.REDIS_PORT     : "something-is-fishy-p";
const __U__ = process.env.REDIS_USER       ? process.env.REDIS_USER     : "something-is-fishy-u";
const __S__ = process.env.REDIS_SECRET     ? process.env.REDIS_SECRET   : "something-is-fishy-s";
const __SDUMMY__ = process.env.REDIS_SECRET_DUMMY      ? process.env.REDIS_SECRET_DUMMY   : "something-is-fishy-sd";


test('putOutboundConnectorDescription correctly retrieves Connector metadata', () => {
    const md = getOutboundConnectorDescription(Connector)
    expect(md.name).toEqual('RedisConnectorNodeJS')
    expect(md.type).toEqual('io.camunda:redis-connector-nodejs:1')
    
    expect(Array.isArray(md.inputVariables)).toBe(true)
    expect(md.inputVariables?.length).toBe(7)
    
    expect(md.inputVariables?.includes('hostname')).toBe(true)
    expect(md.inputVariables?.includes('port')).toBe(true)
    expect(md.inputVariables?.includes('user')).toBe(true)
    expect(md.inputVariables?.includes('token')).toBe(true)
    expect(md.inputVariables?.includes('operationType')).toBe(true)
    expect(md.inputVariables?.includes('key')).toBe(true)
    expect(md.inputVariables?.includes('data')).toBe(true)
} )


test('putOperationForSampleData correctly writes data to db', async () => {
            
            const connector = new Connector();
            const context = new OutboundConnectorContext({});

            if (false) console.log(process.env);

            const theObject = {'audit' : {'name' : 'redis-connector-nodejs','timestamp' : new Date().toISOString() },'data' : {'status'  : true, 'message' : 'writing simple string data. but can support any json as well'}};

            context.setVariables(
                        {   
                            hostname: __H__,
                            port: __P__,
                            user: __U__,
                            token: __S__, 
                            operationType: "PUT", 
                            key: "makelabs",
                            data: JSON.stringify( theObject )
                        } );
            const v = context.getVariablesAsType(ConnectorRequest);
            context.replaceSecrets(v);
            context.validate(v)  ;

            let o = await connector.execute( context );
            expect( o ).toEqual( { status: 'success', message: 'success', data: 'OK' } );
            
}, 10000 ) // end of test


test('putOperationForEmptyData correctly writes empty json object data to db', async () => {
            
    const connector = new Connector();
    const context = new OutboundConnectorContext({});

    context.setVariables(
                {   
                    hostname: __H__,
                    port: __P__,
                    user: __U__,
                    token: __S__, 
                    operationType: "PUT", 
                    key: "makelabs-empty",
                    data: '' // empty data
                } );
    const v = context.getVariablesAsType(ConnectorRequest);
    context.replaceSecrets(v);
    context.validate(v)  ;

    let o = await connector.execute( context );
    expect( o ).toEqual( { status: 'success', message: 'success', data: 'OK' } );
    
}, 10000 ) // end of test


test('connectorInvalidHostname returns an error', async () => {
            
    const outcome = async () => {
          const connector = new Connector();
          const context = new OutboundConnectorContext({});
  
          context.setVariables(
                      {   
                          hostname: "invalid" + __H__,
                          port: __P__,
                          user: __U__,
                          token: __SDUMMY__ , 
                          operationType: "PUT", 
                          key: "some-key",
                          data: '{ id : 123 }'
                      } );
          const v = context.getVariablesAsType(ConnectorRequest);
          context.replaceSecrets(v);
          context.validate(v)  ;
  
          await connector.execute( context );
    }
    expect(outcome).rejects
    // error contains 'ENOTFOUND'
    
  }, 10000 ) // end of test
  
