import { BankCode } from "@ed25519x/kebhana.js";
import { Request, Router } from "express";

const router = Router();

router.get("/info", async (req: Request, res) => {
    const account = req.account;
    const api = req.apiKey;

    if (!account || !api)
        return res.status(401).json({ message: "Unauthorized" });

    const info = await account.fetchOpenBankingInfo();

    if (!await api.deductCredits(1))
        return res.status(402).json({ message: "Payment Required" });

    res.json(info);
});

router.get("/cap", async (req: Request, res) => {
    const account = req.account;
    const api = req.apiKey;

    if (!account || !api)
        return res.status(401).json({ message: "Unauthorized" });

    const cap = await account.fetchOpenBankingCap();

    if (!await api.deductCredits(1))
        return res.status(402).json({ message: "Payment Required" });

    res.json(cap);
});

router.post("/initiate-transfer", async (req: Request, res) => {
    const account = req.account;
    const api = req.apiKey;
    const body = req.body;

    if (!account || !api)
        return res.status(401).json({ message: "Unauthorized" });

    if (!api.hasCredits(2))
        return res.status(402).json({ message: "Payment Required" });

    if (typeof body.from !== "object" || typeof body.from.accountNo !== "string" || typeof body.from.bankCode !== "string")
        return res.status(400).json({ message: "Invalid 'from' field" });

    if (typeof body.to !== "object" || typeof body.to.accountNo !== "string" || typeof body.to.bankCode !== "string")
        return res.status(400).json({ message: "Invalid 'to' field" });

    if (typeof body.amount !== "number" || body.amount <= 0)
        return res.status(400).json({ message: "Invalid 'amount' field" });

    if (typeof body.depositorName !== "string")
        return res.status(400).json({ message: "Invalid 'depositorName' field" });

    if (typeof body.memo !== "string")
        return res.status(400).json({ message: "Invalid 'memo' field" });

    const tx = await account.initiateOpenBankingTransfer({
        from: body.from,
        to: body.to,
        amount: body.amount,
        depositorName: body.depositorName,
        memo: body.memo
    }).catch(e => e);

    if (tx instanceof Error)
        return res.status(400).json({ message: tx.message });

    if (!await api.deductCredits(2))
        return res.status(402).json({ message: "Payment Required" });

    res.json(tx);
});

router.post("/finalize-transfer", async (req: Request, res) => {
    const account = req.account;
    const api = req.apiKey;

    if (!account || !api)
        return res.status(401).json({ message: "Unauthorized" });

    if (!api.hasCredits(5))
        return res.status(402).json({ message: "Payment Required" });

    const tx = await account.finalizeOpenBankingTransfer().catch(e => e);

    if (tx instanceof Error)
        return res.status(400).json({ message: tx.message });

    if (!await api.deductCredits(5))
        return res.status(402).json({ message: "Payment Required" });

    res.json(tx);
});

router.delete("/accounts", async (req: Request, res) => {
    const account = req.account;
    const api = req.apiKey;

    if (!account || !api)
        return res.status(401).json({ message: "Unauthorized" });

    if (!api.hasCredits(1))
        return res.status(402).json({ message: "Payment Required" });

    const bankCode = req.body.bankCode;
    const accountNo = req.body.accountNo;

    if (typeof bankCode !== "string" || typeof accountNo !== "string")
        return res.status(400).json({ message: "Invalid 'bankCode' or 'accountNo' field" });

    const result = await account.deleteOpenBankingAccount({ bankCode, accountNo }).catch(e => e);

    if (result instanceof Error)
        return res.status(400).json({ message: result.message });

    if (!await api.deductCredits(1))
        return res.status(402).json({ message: "Payment Required" });

    res.json({ success: true });
});

router.post("/account-info", async (req: Request, res) => {
    const account = req.account;
    const api = req.apiKey;

    if (!account || !api)
        return res.status(401).json({ message: "Unauthorized" });

    if (!api.hasCredits(1))
        return res.status(402).json({ message: "Payment Required" });

    const bankCode = req.body.bankCode;
    const accountNo = req.body.accountNo;

    if (typeof bankCode !== "string" || typeof accountNo !== "string")
        return res.status(400).json({ message: "Invalid 'bankCode' or 'accountNo' field" });

    const info = await account.fetchOpenBankingAccount({ bankCode, accountNo }).catch(e => e);

    if (info instanceof Error)
        return res.status(400).json({ message: info.message });

    if (!await api.deductCredits(1))
        return res.status(402).json({ message: "Payment Required" });

    res.json(info);
});

router.post("/transactions", async (req: Request, res) => {
    const account = req.account;
    const api = req.apiKey;

    if (!account || !api)
        return res.status(401).json({ message: "Unauthorized" });

    if (!api.hasCredits(1))
        return res.status(402).json({ message: "Payment Required" });

    const bankCode = req.body.bankCode;
    const accountNo = req.body.accountNo;

    if (typeof bankCode !== "string" || typeof accountNo !== "string")
        return res.status(400).json({ message: "Invalid 'bankCode' or 'accountNo' field" });

    const info = await account.fetchOpenBankingTransactions({
        bankCode: bankCode as BankCode,
        accountNo,
        ...req.body
    }).catch(e => e);

    if (info instanceof Error)
        return res.status(400).json({ message: info.message });

    if (!await api.deductCredits(1))
        return res.status(402).json({ message: "Payment Required" });

    res.json(info);
});

export default router;