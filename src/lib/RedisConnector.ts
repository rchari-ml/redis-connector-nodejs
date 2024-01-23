import { OutboundConnector, OutboundConnectorContext, OutboundConnectorFunction, Secret } from "camunda-connector-sdk"
import { ConnectorRequest } from "../dto/ConnectorRequest"

@OutboundConnector( { 
    name : "RedisConnectorNodeJS", 
    type : "io.camunda:redis-connector-nodejs:1",
    inputVariables : [ "hostname", "port", "user", "token", "operationType", "key" ]
} )
export class Connector implements OutboundConnectorFunction {
    async execute(context: OutboundConnectorContext) {
        const req = context.getVariablesAsType(ConnectorRequest)
        context.replaceSecrets(req)
        return this.makeCall(req)
    }

    async makeCall(req: ConnectorRequest) {
        const baseUrl = `redis://`
        const urlString = `${baseUrl}${req.user}:${req.token}@${req.hostname}:${req.port}`
        try {
            console.log(urlString);
            return {
                jsonData: {
                    data: { id : 'makelabs.in' },
                    code: 'success'
                }
            }
        } catch (e: any) {
            throw new Error(`Redis connector API failed with status code: ${e.response.statusCode}`)
        }
    }    
}