import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import { authRouter } from "./routes/auth.js";
import { projectsRouter } from "./routes/projects.js";
import { clipsRouter } from "./routes/clips.js";
import { billingRouter, billingWebhookRouter } from "./routes/billing.js";

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || "*" }));
app.use(morgan("dev"));

// Stripe webhook needs the raw body, so it's mounted before express.json().
app.use("/api/billing", billingWebhookRouter);

app.use(express.json());

app.get("/health", (req, res) => res.json({ ok: true }));

app.use("/api/auth", authRouter);
app.use("/api/projects", projectsRouter);
app.use("/api/clips", clipsRouter);
app.use("/api/billing", billingRouter);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Internal server error" });
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Clippio API listening on :${port}`));
