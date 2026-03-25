import "./bootstrap";
import "reflect-metadata";
import "express-async-errors";
import express, { Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import "./database";
import uploadConfig from "./config/upload";
import AppError from "./errors/AppError";
import routes from "./routes";
import { logger } from "./utils/logger";
import { messageQueue, sendScheduledMessages } from "./queues";

const app = express();

app.set("queues", {
  messageQueue,
  sendScheduledMessages
});

/*  const allowedOrigins = ["http://localhost:3000",
  "https://pps.whatsapp.net/",
  "https://frontend-enviosmasivos.onrender.com",
  process.env.FRONTEND_URL,
]; 

app.use((req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin!)) {
    res.header("Access-Control-Allow-Origin", origin!);
  }

  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );

  // Responde preflight OPTIONS inmediatamente
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
}); */

app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://frontend-enviosmasivos.onrender.com"
  ],
  credentials: true
}));

// --------------------------------------

// Middlewares
app.use(cookieParser());
app.use(express.json());
app.use("/public", express.static(uploadConfig.directory));
app.use(routes);

app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

// Error handler
app.use(async (err: Error, req: Request, res: Response, _: NextFunction) => {
  if (err instanceof AppError) {
    logger.warn(err);
    return res.status(err.statusCode).json({ error: err.message });
  }

  logger.error(err);
  return res.status(500).json({ error: "Internal server error" });
});

export default app;