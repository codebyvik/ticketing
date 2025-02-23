import { Listener, OrderCancelledEvent, Subjects } from "@cbvticketss/common";
import { queueGroupName } from "./queue-group-name";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../models/ticket";
import { TicketUpdatedPublisher } from "../publishers/ticket-updated-publisher";

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
  queueGroupName: string = queueGroupName;

  async onMessage(data: OrderCancelledEvent["data"], msg: Message) {
    // Find the order is reserving
    const ticket = await Ticket.findById(data.ticket.id);
    // If no ticket throw error
    if (!ticket) {
      throw new Error("Ticket not found");
    }

    ticket.set({ orderId: undefined });

    await ticket.save();

    await new TicketUpdatedPublisher(this.client).publish({
      id: ticket.id,
      userId: ticket.userId,
      title: ticket.title,
      price: ticket.price,
      version: ticket.version,
      orderId: ticket.orderId || "",
    });
    // ack the message
    msg.ack();
  }
}
