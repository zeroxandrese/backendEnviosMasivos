import Tag from "../../models/Tag";
import Contact from "../../models/Contact";
import ContactTag from "../../models/ContactTag";
import TicketTag from '../../models/TicketTag';
import Ticket from '../../models/Ticket';

interface Request {
  tags: Tag[];
  contactId: number;
  ticketId: number;
}

const SyncTags = async ({
  tags,
  contactId,
  ticketId,
}: Request): Promise<Tag[] | null> => {

  const contactTagList = tags.filter(tag => tag.kanban === 0)?.map(tag => ({tagId: tag.id, contactId}));
  const ticketTagList = tags.filter(tag => tag.kanban === 1)?.map(tag => ({tagId: tag.id, ticketId}));

  if(contactTagList.length > 0){
   // const contact = await Contact.findByPk(contactId, { include: [Tag] });
    await ContactTag.destroy({ where: { contactId } });
    await ContactTag.bulkCreate(contactTagList);
   // contact?.reload();
  }

  if(ticketTagList.length > 0){
    await TicketTag.destroy({where:{ticketId}});
    await TicketTag.bulkCreate(ticketTagList);
  }

   return tags;
};

export default SyncTags;
