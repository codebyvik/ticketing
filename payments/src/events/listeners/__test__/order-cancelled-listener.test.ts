import { natsWrapper } from "../../../nats-wrapper";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { OrderCancelledEvent, OrderStatus } from "@cbvticketss/common";
import { OrderCancelledListener } from "../order-cancelled-listener";
import { Order } from "../../../models/order";

const setup = async () => {
  // create an instance of the listener
  const listener = new OrderCancelledListener(natsWrapper.client);
  //   Create and save a order

  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    price: 20,
    status: OrderStatus.Created,
    userId: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
  });

  await order.save();

  // create a fake data event
  const data: OrderCancelledEvent["data"] = {
    id: order.id,
    version: 1,
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

it("updates the ticket , publishes an event and acks the message", async () => {
  const { listener, data, msg } = await setup();
  // call the onMessage function with the data object + message object
  await listener.onMessage(data, msg);
  // write assertions to make sure a ticket was created
  const updatedOrder = await Order.findById(data.id);

  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it("acks the message", async () => {
  const { listener, data, msg } = await setup();
  // call the onMessage function with the data object + message object
  await listener.onMessage(data, msg);
  // write assertions to make sure ack function is called
  expect(msg.ack).toHaveBeenCalled();
});
