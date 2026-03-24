import gracefulShutdown from "http-graceful-shutdown";
import app from "./app";
import { initIO } from "./libs/socket";
import { logger } from "./utils/logger";
import { StartAllWhatsAppsSessions } from "./services/WbotServices/StartAllWhatsAppsSessions";
import Company from "./models/Company";
import { startQueueProcess } from "./queues";

const PORT = Number(process.env.PORT);

if (!PORT) {
  throw new Error("❌ PORT no está definido. Render debe proveerlo.");
}

const server = app.listen(PORT, "0.0.0.0", () => {
  logger.info(`🚀 Server UP on port: ${PORT}`);
});


initIO(server);
gracefulShutdown(server);

console.log("PORT:", process.env.PORT);
console.log("DATABASE_URL:", process.env.DATABASE_URL);
console.log("REDIS_URI:", process.env.REDIS_URI);

(async () => {
  try {
    logger.info("🔄 Starting async services...");

    const companies = await Company.findAll();

    await Promise.all(
      companies.map(c => StartAllWhatsAppsSessions(c.id))
    );

    await startQueueProcess();

    logger.info("✅ Background services started");
  } catch (error: any) {
    logger.error("❌ Startup error:", error);
    console.error("STACK 💥", error?.stack);

  }
})();

process.on("uncaughtException", err => {
  console.error(`${new Date().toUTCString()} uncaughtException:`, err.message);
  console.error(err.stack);
});

process.on("unhandledRejection", (reason, p) => {
  console.error(
    `${new Date().toUTCString()} unhandledRejection:`,
    reason,
    p
  );
});
