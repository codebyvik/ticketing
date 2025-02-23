import { natsWrapper } from "../../../nats-wrapper";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { OrdercreatedListener } from "../order-created-listener";
import { OrderCreatedEvent, OrderStatus } from "@cbvticketss/common";
import { Order } from "../../../models/order";

const setup = async () => {
  // create an instance of the listener
  const listener = new OrdercreatedListener(natsWrapper.client);
  //   Create and save a ticket

  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    price: 20,
    status: OrderStatus.Created,
    userId: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
  });

  await order.save();

  // create a fake data event
  const data: OrderCreatedEvent["data"] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    userId: order.userId,
    expiresAt: "jsjsj",
    ticket: {
      id: new mongoose.Types.ObjectId().toHexString(),
      price: 20,
    },
  };
  // create a fake message object
  //   @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg, order };
};

it("replicates the order info ", async () => {
  const { listener, data, msg } = await setup();
  // call the onMessage function with the data object + message object
  await listener.onMessage(data, msg);
  // write assertions to make sure a ticket was created
  const order = await Order.findById(data.id);

  expect(order!.id).toEqual(data.id);
  expect(order!.price).toEqual(data.ticket.price);
});

it("acks the message", async () => {
  const { listener, data, msg } = await setup();
  // call the onMessage function with the data object + message object
  await listener.onMessage(data, msg);
  // write assertions to make sure ack function is called
  expect(msg.ack).toHaveBeenCalled();
});
