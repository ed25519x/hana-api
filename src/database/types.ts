import { Document } from "mongoose";

export enum Plan {
    Lite,
    Basic,
    Pro,
    Enterprise
};

export default interface IAPIKey {
    uuid: string;
    credits: {
        remaining: number;
        renewal: number;
    };
    customer_ids: string[];
    credentials: {
        accountId: string;
        uuid: string;
        berry: string;
        custNo: string;
        pin: string;
        privateKey: string;
    }[];
    expires: Date;
    plan: Plan;
    key: string;
    secret: string;
    deductCredits: (amount: number) => Promise<boolean>;
    hasCredits: (amount: number) => boolean;
};

export type APIKeyDocument = IAPIKey & Document;