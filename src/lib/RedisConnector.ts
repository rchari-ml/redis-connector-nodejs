import { OutboundConnector, OutboundConnectorContext, OutboundConnectorFunction, Secret } from "camunda-connector-sdk"
import { ConnectorRequest } from "../dto/ConnectorRequest"

@OutboundConnector( { 
    name : "RedisConnectorNodeJS", 
    type : "io.camunda:redis-connector-nodejs:1",
    inputVariables : [ "authentication", "operationType", "key" ]
} )
export class RedisConnector implements OutboundConnectorFunction {
    async execute(context: OutboundConnectorContext) {
        const req = context.getVariablesAsType(ConnectorRequest)
        context.replaceSecrets(req)
        return this.makeCall(req)
    }

    async makeCall(req: ConnectorRequest) {
        const baseUrl = `redis://`
        const urlString = `${baseUrl}${req.authentication.user}:${req.authentication.token}@${req.authentication.hostname}:${req.authentication.port}`
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