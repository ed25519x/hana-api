import { Request, Response, Router } from "express";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
    if (!req.account)
        return res.status(401).send("Unauthorized");

    const accounts = await req.account.fetchAccounts().catch(e => e);

    if (accounts instanceof Error)
        return res.status(400).send(accounts.message);

    if (!await req.apiKey?.deductCredits(1))
        return res.status(402).send("Payment Required");

    return res.json(accounts);
});

router.get("/:accountNo/transactions", async (req: Request, res: Response) => {
    const api = req.apiKey;
    const account = req.account;

    if (!api || !account)
        return res.status(401).json({ message: "Unauthorized" });

    const accountNo = req.params.accountNo;
    const limit = req.query.limit;
    const page = req.query.page;

    if (limit && typeof limit !== "string")
        return res.status(400).json({ message: "Invalid 'limit' in query" });

    if (page && typeof page !== "string")
        return res.status(400).json({ message: "Invalid 'page' in query" });

    if (!api.hasCredits(1))
        return res.status(402).json({ message: "Insufficient credits" });

    const txs = await account.transactions({
        accountNumber: accountNo,
        limit: limit ? parseInt(limit) : undefined,
        page: page ? parseInt(page) : undefined
    }).catch(e => e);

    if (txs instanceof Error)
        return res.status(400).json({ message: txs.message });

    if (!api.deductCredits(1))
        return res.status(402).json({ message: "Insufficient credits" });

    res.json(txs);
});

router.post("/initiate-transfer", async (req: Request, res: Response) => {
    const api = req.apiKey;
    const account = req.account;

    if (!api || !account)
        return res.status(401).json({ message: "Unauthorized" });

    const body = req.body;
    const amount = body.amount;
    const to = body.to;
    const from = body.from;
    const bankCode = body.bankCode;
    const depositorName = body.depositorName;
    const memo = body.memo;

    if (typeof amount !== "number" || amount <= 0)
        return res.status(400).json({ message: "Invalid 'amount' in request body" });

    if (typeof to !== "string")
        return res.status(400).json({ message: "Invalid 'to' in request body" });

    if (typeof from !== "string")
        return res.status(400).json({ message: "Invalid 'from' in request body" });

    if (typeof bankCode !== "string")
        return res.status(400).json({ message: "Invalid 'bankCode' in request body" });

    if (depositorName && typeof depositorName !== "string")
        return res.status(400).json({ message: "Invalid 'depositorName' in request body" });

    if (memo && typeof memo !== "string")
        return res.status(400).json({ message: "Invalid 'memo' in request body" });

    if (!api.hasCredits(2))
        return res.status(402).json({ message: "Insufficient credits" });

    const transfer = await account.initiateTransfer({
        amount,
        to,
        from,
        bankCode: bankCode as any,
        depositorName,
        memo,
    }).catch(e => e);

    if (transfer instanceof Error)
        return res.status(400).json({ message: transfer.message });

    if (!api.deductCredits(2))
        return res.status(402).json({ message: "Insufficient credits" });

    res.json(transfer);
});

router.post("/process-transfer", async (req: Request, res: Response) => {
    const api = req.apiKey;
    const account = req.account;

    if (!api || !account)
        return res.status(401).json({ message: "Unauthorized" });

    const { tx, passcode } = req.body;

    if (typeof tx !== "object")
        return res.status(400).json({ message: "Invalid 'tx' in request body" });

    if (typeof passcode !== "string" || passcode.length !== 4)
        return res.status(400).json({ message: "Invalid 'passcode' in request body" });

    if (typeof tx.memo !== "string" ||
        typeof tx.amount !== "number" ||
        typeof tx.to !== "string" ||
        typeof tx.from !== "string" ||
        typeof tx.bankCode !== "string" ||
        typeof tx.fee !== "number" ||
        typeof tx.receiver !== "string" ||
        typeof tx.sender !== "string" ||
        typeof tx.transactionId !== "string" ||
        typeof tx.depositorName !== "string")
        return res.status(400).json({ message: "Invalid 'tx' in request body" });

    if (!api.hasCredits(7))
        return res.status(402).json({ message: "Insufficient credits" });

    const txid = await account.processTransfer(tx, passcode).catch(e => e);

    if (txid instanceof Error)
        return res.status(400).json({ message: txid.message });

    if (!api.deductCredits(7))
        return res.status(402).json({ message: "Insufficient credits" });

    res.json({ txid });
});

export default router;