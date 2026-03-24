import { proto, WASocket } from "@whiskeysockets/baileys";
import cacheLayer from "../libs/cache";
import { getIO } from "../libs/socket";
import Message from "../models/Message";
import Ticket from "../models/Ticket";
import { logger } from "../utils/logger";
import GetTicketWbot from "./GetTicketWbot";

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const SetTicketMessagesAsRead = async (ticket: Ticket): Promise<void> => {

  if (!ticket.isBot && (ticket.userId || ticket.isGroup)) {
    await ticket.update({ unreadMessages: 0 });
    await cacheLayer.set(`contacts:${ticket.contactId}:unreads`, "0");
  }

  if (ticket.channel === "whatsapp") {
    try {

      const wbot: WASocket = await GetTicketWbot(ticket);

      const messages = await Message.findAll({
        where: {
          ticketId: ticket.id,
          fromMe: false,
          read: false
        },
        order: [["createdAt", "ASC"]]
      });

      if (messages.length > 0) {

        const keys: proto.IMessageKey[] = [];

        for (const message of messages) {
          try {

            const msg: proto.IWebMessageInfo = JSON.parse(message.dataJson);

            if (
              msg?.key &&
              msg.key.fromMe === false &&
              !ticket.isBot &&
              (ticket.userId || ticket.isGroup)
            ) {
              keys.push(msg.key);
            }

          } catch (err) {
            logger.warn("Error parsing message json");
          }
        }

        if (keys.length > 0) {
          await wbot.readMessages(keys);
          await delay(200);
        }
      }

      if (!ticket.isBot && (ticket.userId || ticket.isGroup)) {
        await Message.update(
          { read: true },
          {
            where: {
              ticketId: ticket.id,
              read: false
            }
          }
        );
      }

    } catch (err) {
      console.log(err);
      logger.warn(
        `Could not mark messages as read. Maybe whatsapp session disconnected? Err: ${err}`
      );
    }
  }

  const io = getIO();

  io
    .to(ticket.status)
    .to("notification")
    .emit(`company-${ticket.companyId}-ticket`, {
      action: "updateUnread",
      ticketId: ticket.id
    });
};

export default SetTicketMessagesAsRead;
