

import { NotNull } from '../index';
import { Secret } from "camunda-connector-sdk";

export class ConnectorRequest {
    hostname!: string;
    port!: string;
    user!: string;
    @Secret token!: string;

    @NotNull operationType!: string;
    @NotNull key!: string;

}