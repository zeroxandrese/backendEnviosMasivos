import gracefulShutdown from "http-graceful-shutdown";
import app from "./app";
import { initIO } from "./libs/socket";
import { logger } from "./utils/logger";
import { StartAllWhatsAppsSessions } from "./services/WbotServices/StartAllWhatsAppsSessions";
import Company from "./models/Company";
import { startQueueProcess } from "./queues";

const PORT = Number(process.env.PORT) || 3000;

const server = app.listen(PORT, "0.0.0.0", async () => {
  try {
    const companies = await Company.findAll();

    const promises = companies.map(c =>
      StartAllWhatsAppsSessions(c.id)
    );

    await Promise.all(promises);

    await startQueueProcess();

    logger.info(`Server started on port: ${process.env.PORT}`);
  } catch (error) {
    logger.error("Error starting server:", error);
    console.error("STACK 💥", error?.stack);
  }
});

process.on("uncaughtException", err => {
  console.error(`${new Date().toUTCString()} uncaughtException:`, err.message);
  console.error(err.stack);
  process.exit(1);
});

process.on("unhandledRejection", (reason, p) => {
  console.error(
    `${new Date().toUTCString()} unhandledRejection:`,
    reason,
    p
  );
  process.exit(1);
});

initIO(server);
gracefulShutdown(server);
