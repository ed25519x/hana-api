import { KebHana } from '@ed25519x/kebhana.js';
import { APIKeyDocument } from './database/types.ts';

declare module "express" {
  export interface Request {
    apiKey?: APIKeyDocument;
    account?: KebHana;
  }
}

namespace NodeJS {
  interface ProcessEnv {
    mongo_uri: string;
  }
}