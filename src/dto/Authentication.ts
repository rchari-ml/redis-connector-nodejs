import { Secret } from "camunda-connector-sdk";

// Note: This data class is no longer in use.
export class Authentication {
    hostname!: string;
    port!: string;
    user!: string;
    @Secret
    token!: string;
}

