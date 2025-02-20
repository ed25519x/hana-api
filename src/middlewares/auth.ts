import { NextFunction, Request, Response } from "express";
import { apiKeyModel } from "../database/models.js";
import { createHmac } from "crypto";
import APIManager from "../api-manager.js";

async function authMiddleware(req: Request, res: Response, next: NextFunction) {
    if (req.headers.authorization) {
        const key = await apiKeyModel.findOne({ key: req.headers.authorization });

        if (!key)
            return res.status(401).json({ message: "Invalid API key" });

        const timestamp = req.headers["x-timestamp"]?.toString();

        if (!timestamp)
            return res.status(401).json({ message: "Missing timestamp" });

        if (!/^\d+$/.test(timestamp))
            return res.status(401).json({ message: "Invalid timestamp" });

        if (Math.abs(Date.now() - parseInt(timestamp)) > 60000)
            return res.status(401).json({ message: "Time difference is too large", timestamp: Date.now() });

        const signature = createHmac("sha512", key.secret).update(timestamp).digest("base64url");

        if (signature !== req.headers["x-signature"])
            return res.status(401).json({ message: "Invalid signature" });

        req.apiKey = key;

        const accountId = req.headers["x-account-id"]?.toString();

        if (accountId) {
            if (!key.credentials.some(a => a.accountId === accountId))
                return res.status(401).json({ message: "Invalid account ID" });

            const api = APIManager.getAPI(accountId);

            if (!api)
                return res.status(401).json({ message: "This account is inactive" });

            req.account = api;
        }
    }

    next();
}

export default authMiddleware;