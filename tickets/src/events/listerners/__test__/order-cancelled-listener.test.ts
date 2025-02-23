import { natsWrapper } from "../../../nats-wrapper";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../../models/ticket";
import { OrderCancelledEvent } from "@cbvticketss/common";
import { OrderCancelledListener } from "../order-cancelled-listener";

const setup = async () => {
  // create an instance of the listener
  const listener = new OrderCancelledListener(natsWrapper.client);
  //   Create and save a ticket
  const orderId = new mongoose.Types.ObjectId().toHexString();
  const ticket = Ticket.build({
    title: "concert",
    price: 20,
    userId: new mongoose.Types.ObjectId().toHexString(),
  });

  ticket.set({ orderId });

  await ticket.save();

  // create a fake data event
  const data: OrderCancelledEvent["data"] = {
    id: orderId,
    version: 0,
    ticket: {
      id: ticket.id,
      price: ticket.price,
    },
  };
  // create a fake message object
  //   @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg, ticket };
};

it("updates the ticket , publishes an event and acks the message", async () => {
  const { listener, data, msg, ticket } = await setup();
  // call the onMessage function with the data object + message object
  await listener.onMessage(data, msg);
  // write assertions to make sure a ticket was created
  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket!.orderId).not.toBeDefined();
  expect(msg.ack).toHaveBeenCalled();
  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
