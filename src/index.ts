import express from "express";
import mongoose from "mongoose";
import authMiddleware from "./middlewares/auth.js";
import basicRouter from "./routes/basic/index.js";
import accountsRouter from "./routes/accounts/index.js";
import openBankingRouter from "./routes/open-banking/index.js";
import groupsRouter from "./routes/groups/index.js";
import queryRoutes from "./routes/query/index.js";

import dotenv from "dotenv";
dotenv.config();

if (!process.env.mongo_uri) throw new Error("Missing 'mongo_uri' in .env");

await mongoose.connect(process.env.mongo_uri);

const app = express();

app.use(express.json());

app.use(authMiddleware);

app.use("/basic", basicRouter);
app.use("/accounts", accountsRouter);
app.use("/open-banking", openBankingRouter);
app.use("/groups", groupsRouter);
app.use("/query", queryRoutes);

app.listen(6969, () => console.log("Server is up and running"));