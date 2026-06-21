/**
 * Runtime configuration consumed by application infrastructure.
 */
export interface AppConfig {
  apiPrefix: string;
  corsOrigin: boolean | string[];
  mongodbUri: string;
  port: number;
}
