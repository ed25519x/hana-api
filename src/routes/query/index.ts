import { Request, Router } from "express";

const router = Router();

router.get("/employees", async (req: Request, res) => {
    const api = req.apiKey;
    const account = req.account;

    if (!api || !account)
        return res.status(401).json({ message: "Unauthorized" });

    const query = req.query.query;

    if (typeof query !== "string")
        return res.status(400).json({ message: "Invalid 'query' in search query" });

    if (!api.hasCredits(1))
        return res.status(402).json({ message: "Insufficient credits" });

    const employees = await account.searchEmployee(query).catch(e => e);

    if (employees instanceof Error)
        return res.status(400).json({ message: employees.message });

    if (!api.deductCredits(1))
        return res.status(402).json({ message: "Insufficient credits" });

    res.json(employees);
});

router.get("/branches", async (req: Request, res) => {
    const api = req.apiKey;
    const account = req.account;

    if (!api || !account)
        return res.status(401).json({ message: "Unauthorized" });

    const query = req.query.query;

    if (typeof query !== "string")
        return res.status(400).json({ message: "Invalid 'query' in search query" });

    if (!api.hasCredits(1))
        return res.status(402).json({ message: "Insufficient credits" });

    const branches = await account.searchBranch(query).catch(e => e);

    if (branches instanceof Error)
        return res.status(400).json({ message: branches.message });

    if (!api.deductCredits(1))
        return res.status(402).json({ message: "Insufficient credits" });

    res.json(branches);
});

router.post("/account", async (req: Request, res) => {
    const api = req.apiKey;
    const account = req.account;

    if (!api || !account)
        return res.status(401).json({ message: "Unauthorized" });

    const { bankCode, accountNo } = req.body;
    
    if (typeof bankCode !== "string" || typeof accountNo !== "string")
        return res.status(400).json({ message: "Invalid 'bankCode' or 'accountNo' in search query" });

    if (!api.hasCredits(1))
        return res.status(402).json({ message: "Insufficient credits" });

    const accountInfo = await account.checkAccount({ bankCode, accountNo }).catch(e => e);

    if (accountInfo instanceof Error)
        return res.status(400).json({ message: accountInfo.message });

    if (!api.deductCredits(1))
        return res.status(402).json({ message: "Insufficient credits" });

    res.json(accountInfo);
});

export default router;