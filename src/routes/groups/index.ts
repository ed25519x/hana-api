import { KebHana } from "@ed25519x/kebhana.js";
import { Request, Router } from "express";

const router = Router();

router.get("/", async (req: Request, res) => {
    const account = req.account;
    const api = req.apiKey;

    if (!account || !api)
        return res.status(401).json({ message: "Unauthorized" });

    if (!api.hasCredits(1))
        return res.status(402).json({ message: "Payment Required" });

    const groups = await account.lookupGroups();

    if (!await api.deductCredits(1))
        return res.status(402).json({ message: "Payment Required" });

    res.json(groups);
});

router.put("/", async (req: Request, res) => {
    const account = req.account;
    const api = req.apiKey;

    if (typeof req.body.name !== "string" || typeof req.body.accountNo !== "string")
        return res.status(400).json({ message: "Bad Request" });

    if (!account || !api)
        return res.status(401).json({ message: "Unauthorized" });

    if (!api.hasCredits(30))
        return res.status(402).json({ message: "Payment Required" });

    const group = await account.createGroupAccount({
        name: req.body.name,
        accountNo: req.body.accountNo,
        bypass_possibility_check: true
    }).catch(e => e);

    if (group instanceof Error)
        return res.status(400).json({ message: group.message });

    if (!await api.deductCredits(30))
        return res.status(402).json({ message: "Payment Required" });

    res.json(group);
});

router.put("/invitations", async (req: Request, res) => {
    const account = req.account;
    const api = req.apiKey;

    const encryptedSequenceNo = req.body.encryptedSequenceNo;

    if (typeof encryptedSequenceNo !== "string")
        return res.status(400).json({ message: "Bad Request" });

    if (!account || !api)
        return res.status(401).json({ message: "Unauthorized" });

    if (!api.hasCredits(1))
        return res.status(402).json({ message: "Payment Required" });

    const invite = await account.createInvitation().catch(e => e);

    if (invite instanceof Error)
        return res.status(400).json({ message: invite.message });

    await api.deductCredits(1);

    const url = KebHana.createInviteURL(encryptedSequenceNo, invite);

    res.json({ url, invite });
});

router.post("/fetch-invitation-details", async (req: Request, res) => {
    const account = req.account;
    const api = req.apiKey;

    const encryptedRequestDate = req.body.encryptedRequestDate;
    const encryptedSequenceNo = req.body.encryptedSequenceNo;

    if (typeof encryptedSequenceNo !== "string" || typeof encryptedRequestDate !== "string")
        return res.status(400).json({ message: "Bad Request" });

    if (!account || !api)
        return res.status(401).json({ message: "Unauthorized" });

    if (!api.hasCredits(1))
        return res.status(402).json({ message: "Payment Required" });

    const invite = await account.fetchInvitationInfo({ encryptedRequestDate, encryptedSequenceNo }).catch(e => e);

    if (invite instanceof Error)
        return res.status(400).json({ message: invite.message });

    await api.deductCredits(1);

    res.json(invite);
});

router.post("/accept-invitation", async (req: Request, res) => {
    const account = req.account;
    const api = req.apiKey;

    const encryptedSequenceNo = req.body.encryptedSequenceNo;

    if (typeof encryptedSequenceNo !== "string")
        return res.status(400).json({ message: "Bad Request" });

    if (!account || !api)
        return res.status(401).json({ message: "Unauthorized" });

    if (!api.hasCredits(1))
        return res.status(402).json({ message: "Payment Required" });

    const invite = await account.acceptInvitation(encryptedSequenceNo).catch(e => e);

    if (invite instanceof Error)
        return res.status(400).json({ message: invite.message });

    await api.deductCredits(1);

    res.json({ success: true });
});

router.post("/approve-join-request", async (req: Request, res) => {
    const account = req.account;
    const api = req.apiKey;

    const encryptedSequenceNo = req.body.encryptedSequenceNo;
    const targetCustomerNo = req.body.targetCustomerNo;

    if (typeof encryptedSequenceNo !== "string")
        return res.status(400).json({ message: "Bad Request" });

    if (!account || !api)
        return res.status(401).json({ message: "Unauthorized" });

    if (!api.hasCredits(1))
        return res.status(402).json({ message: "Payment Required" });

    const invite = await account.approveJoinRequest(encryptedSequenceNo, targetCustomerNo).catch(e => e);

    if (invite instanceof Error)
        return res.status(400).json({ message: invite.message });

    await api.deductCredits(1);

    res.json({ success: true });
});

export default router;