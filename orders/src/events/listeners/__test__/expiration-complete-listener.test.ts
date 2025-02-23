import { natsWrapper } from "../../../nats-wrapper";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../../models/ticket";
import { ExpirationCompleteListener } from "../expiration-complete-listener";
import { ExpirationCompleteEvent, OrderStatus } from "@cbvticketss/common";
import { Order } from "../../../models/order";

const setup = async () => {
  const listener = new ExpirationCompleteListener(natsWrapper.client);

  const userId = new mongoose.Types.ObjectId().toHexString();
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "concert",
    price: 20,
  });
  await ticket.save();

  const order = Order.build({
    status: OrderStatus.Created,
    userId,
    expiresAt: new Date(),
    ticket,
  });

  await order.save();

  const data: ExpirationCompleteEvent["data"] = {
    orderId: order.id,
  };
  // create a fake message object
  //   @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, ticket, order, data, msg };
};

it("updates the order status to cancelled", async () => {
  const { listener, order, ticket, data, msg } = await setup();

  // call the onMessage function with the data object + message object
  await listener.onMessage(data, msg);
  // write assertions to make sure a ticket was created
  const updatedOrder = await Order.findById(order.id);

  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});
it("publishes order cancelled event", async () => {
  const { listener, order, data, msg } = await setup();
  // call the onMessage function with the data object + message object
  await listener.onMessage(data, msg);
  // write assertions to make sure a ticket was created
  expect(natsWrapper.client.publish).toHaveBeenCalled();
  const eventData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[1][1]);

  expect(eventData.id).toEqual(order.id);
});

it("acks the message", async () => {
  const { listener, data, msg } = await setup();
  // call the onMessage function with the data object + message object
  await listener.onMessage(data, msg);
  // write assertions to make sure ack function is called
  expect(msg.ack).toHaveBeenCalled();
});
