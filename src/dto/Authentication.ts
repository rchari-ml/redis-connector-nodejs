import { Secret } from "camunda-connector-sdk";

export class Authentication {
    hostname!: string;
    port!: string;
    user!: string;
    @Secret
    token!: string;
}

