
import { Authentication } from './Authentication';

export class ConnectorRequest {
    authentication!: Authentication;
    operationType!: string;
    key!: string;

}