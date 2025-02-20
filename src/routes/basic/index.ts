import { Request, Response, Router } from "express";
import { KebHana } from "@ed25519x/kebhana.js";
import APIManager from "../../api-manager.js";

const router = Router();

router.post("/login", async (req: Request, res: Response) => {
    const { accountId } = req.body;

    if (!accountId)
        return res.status(400).json({ message: "Missing account ID" });

    const credentials = req.apiKey?.credentials.find((c) => c.accountId === accountId);

    if (!credentials)
        return res.status(401).json({ message: "Invalid account ID" });

    const t = Date.now();

    const api = await KebHana.loginByPrivateKey(credentials).catch(e => e);

    if (api instanceof Error)
        return res.status(400).json({ message: api.message });

    APIManager.setAPI(accountId, api);

    res.json({ message: `Login took ${Date.now() - t}ms` });
});

router.get("/api-info", async (req: Request, res: Response) => {
    res.json({
        message: "System is up and running",
        key: req.apiKey ? {
            uuid: req.apiKey.uuid,
            credits: req.apiKey.credits,
        } : null,
        urls: {
            discord: "https://discord.gg/bPVYx9Aj2j",
            signal: "https://signal.group/#CjQKIKI8uqsbvT689nirk3YwKbne3pliRH3jEOOSCEmFRlUxEhC7BTGhQIIP_yMvolLLBI04"    
        }
    });
});

router.get("/coupons", async (req: Request, res: Response) => {
    const api = req.apiKey;
    const account = req.account;

    if (!api || !account)
        return res.status(401).json({ message: "Unauthorized" });

    if (!api.hasCredits(1))
        return res.status(402).json({ message: "Insufficient credits" });

    const coupons = await account.fetchCoupons().catch(e => e);

    if (!api.deductCredits(1))
        return res.status(402).json({ message: "Insufficient credits" });

    if (coupons instanceof Error)
        return res.status(400).json({ message: coupons.message });

    res.json(coupons);
});

router.get("/profile", async (req: Request, res: Response) => {
    const api = req.apiKey;
    const account = req.account;

    if (!api || !account)
        return res.status(401).json({ message: "Unauthorized" });

    if (!api.hasCredits(3))
        return res.status(402).json({ message: "Insufficient credits" });

    const profile = await account.fetchCustomerInfo().catch(e => e);

    if (profile instanceof Error)
        return res.status(400).json({ message: profile.message });

    if (!api.deductCredits(3))
        return res.status(402).json({ message: "Insufficient credits" });

    res.json(profile);
});

router.post("/authenticate-qr", async (req: Request, res: Response) => {
    const api = req.apiKey;
    const account = req.account;

    if (!api || !account)
        return res.status(401).json({ message: "Unauthorized" });

    const code = req.body.code;

    if (typeof code !== "string" || code.length !== 6)
        return res.status(400).json({ message: "Missing or Invalid code" });

    if (!api.hasCredits(3))
        return res.status(402).json({ message: "Insufficient credits" });

    const qrCode = await account.authenticateQR(code).catch(e => e);

    if (qrCode instanceof Error)
        return res.status(400).json({ message: qrCode.message });

    if (!api.deductCredits(3))
        return res.status(402).json({ message: "Insufficient credits" });

    res.json({ success: true });
});

export default router;