import { Listener, OrderCreatedEvent, OrderStatus, Subjects } from "@cbvticketss/common";
import { queueGroupName } from "./queue-group-name";
import { Message } from "node-nats-streaming";
import { Order } from "../../models/order";

export class OrdercreatedListener extends Listener<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  queueGroupName: string = queueGroupName;

  async onMessage(data: OrderCreatedEvent["data"], msg: Message) {
    const order = Order.build({
      id: data.id,
      price: data.ticket.price,
      status: data.status,
      userId: data.userId,
      version: data.version,
    });

    await order.save();

    // ack the message
    msg.ack();
  }
}
