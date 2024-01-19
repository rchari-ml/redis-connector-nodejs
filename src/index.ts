export { BPMNError } from "./bpmnerror";
export { NotNull   } from "./validationdef";
export { OutboundConnectorContext } from "./outbound-context";
export { OutboundConnector, OutboundConnectorFunction, getOutboundConnectorDescription } from "./outbound";
export { Secret, ReplaceSecretImplementation } from "./secret";

export { RedisConnector } from "./lib/RedisConnector"

//Below code is failing during npm install step
//import { WorkerConnectorRuntime } from "camunda-connector-worker-runtime";
//const runtime = new WorkerConnectorRuntime()