
import { ConnectorRequest } from "../dto/ConnectorRequest"
import { OutboundConnector, OutboundConnectorContext, OutboundConnectorFunction } from "camunda-connector-sdk"
import { getOutboundConnectorDescription } from '../outbound'
import { Connector } from '../lib/RedisConnector'

var dotenv = require("dotenv").config( {  } );
const __H__ = process.env.REDIS_HOSTNAME   ? process.env.REDIS_HOSTNAME : "something-is-fishy-h";
const __P__ = process.env.REDIS_PORT       ? process.env.REDIS_PORT     : "something-is-fishy-p";
const __U__ = process.env.REDIS_USER       ? process.env.REDIS_USER     : "something-is-fishy-u";
const __S__ = process.env.REDIS_SECRET     ? process.env.REDIS_SECRET   : "something-is-fishy-s";
const __SDUMMY__ = process.env.REDIS_SECRET_DUMMY      ? process.env.REDIS_SECRET_DUMMY   : "something-is-fishy-sd";

function sleep(ms : any) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }


test('getOutboundConnectorDescription correctly retrieves Connector metadata', () => {
    const md = getOutboundConnectorDescription(Connector)
    expect(md.name).toEqual('RedisConnectorNodeJS')
    expect(md.type).toEqual('io.camunda:redis-connector-nodejs:1')
    
    expect(Array.isArray(md.inputVariables)).toBe(true)
    expect(md.inputVariables?.length).toBe(6)
    
    expect(md.inputVariables?.includes('hostname')).toBe(true)
    expect(md.inputVariables?.includes('port')).toBe(true)
    expect(md.inputVariables?.includes('user')).toBe(true)
    expect(md.inputVariables?.includes('token')).toBe(true)
    expect(md.inputVariables?.includes('operationType')).toBe(true)
    expect(md.inputVariables?.includes('key')).toBe(true)
} )


test('getOperationForNoDataAsKey correctly retrieves null as output', async () => {
            

            const connector = new Connector();
            const context = new OutboundConnectorContext({});

            if (false) console.log(process.env);

            context.setVariables(
                        {   
                            hostname: __H__,
                            port: __P__,
                            user: __U__,
                            token: __S__, 
                            operationType: "GET", 
                            key: "no-data"
                        } );
            const v = context.getVariablesAsType(ConnectorRequest);
            context.replaceSecrets(v);
            context.validate(v)  ;

            let o = await connector.execute( context );
            expect( o ).toEqual( { status: 'nodata', message: 'nodata for the given key', data: {} } );
            
}, 10000 ) // end of test


test('connectorInvalidPassword returns an error', async () => {
            

  const connector = new Connector();
  const context = new OutboundConnectorContext({});

  if (false) console.log(process.env);

  context.setVariables(
              {   
                  hostname: __H__,
                  port: __P__,
                  user: __U__,
                  token: __SDUMMY__ , 
                  operationType: "GET", 
                  key: "no-data"
              } );
  const v = context.getVariablesAsType(ConnectorRequest);
  context.replaceSecrets(v);
  context.validate(v)  ;

  let o = await connector.execute( context );
  expect( o.status  ).toEqual( 'error' );
  expect( o.message )
        .toContain( 'Runtime error while creating connection' );
  expect( o.message )
        .toContain( 'WRONGPASS' );
  expect( o.data    ).toEqual( {}  );
  
}, 10000 ) // end of test


test('connectorInvalidHostname returns an error', async () => {
            

  const connector = new Connector();
  const context = new OutboundConnectorContext({});

  if (false) console.log(process.env);

  context.setVariables(
              {   
                  hostname: "invalid" + __H__,
                  port: __P__,
                  user: __U__,
                  token: __SDUMMY__ , 
                  operationType: "GET", 
                  key: "no-data"
              } );
  const v = context.getVariablesAsType(ConnectorRequest);
  context.replaceSecrets(v);
  context.validate(v)  ;

  let o = await connector.execute( context );
  expect( o.status  ).toEqual( 'error' );
  expect( o.message )
        .toContain( 'Runtime error while creating connection' );
  expect( o.message )
        .toContain( 'ENOTFOUND' );
  expect( o.data    ).toEqual( {}  );
  
}, 10000 ) // end of test