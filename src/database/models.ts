import mongoose from "mongoose";
import IAPIKey from "./types.js";
import { randomUUID } from "crypto";

const apiKeySchema = new mongoose.Schema({
    uuid: { type: String, default: () => randomUUID() },
    credits: {
        remaining: { type: Number, default: 0 },
        renewal: { type: Number, default: 0 }
    },
    customer_ids: { type: [String], default: [] },
    credentials: [{
        accountId: { type: String, required: true },
        uuid: { type: String, required: true },
        berry: { type: String, required: true },
        custNo: { type: String, required: true },
        pin: { type: String, required: true },
        privateKey: { type: String, required: true }
    }],
    expires: { type: Date, required: true },
    plan: { type: Number, required: true },
    key: { type: String, required: true },
    secret: { type: String, required: true },
});

apiKeySchema.methods.deductCredits = async function (amount: number) {
    if (this.credits.remaining < amount) {
        return false;
    }

    this.credits.remaining -= amount;
    await this.save();

    return true;
};

apiKeySchema.methods.hasCredits = function (amount: number) {
    return this.credits.remaining >= amount;
}

export const apiKeyModel = mongoose.model<IAPIKey>("APIKey", apiKeySchema);