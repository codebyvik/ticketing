import { natsWrapper } from "../../../nats-wrapper";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../../models/ticket";
import { OrdercreatedListener } from "../order-created-listener";
import { OrderCreatedEvent, OrderStatus } from "@cbvticketss/common";

const setup = async () => {
  // create an instance of the listener
  const listener = new OrdercreatedListener(natsWrapper.client);
  //   Create and save a ticket

  const ticket = Ticket.build({
    title: "concert",
    price: 20,
    userId: new mongoose.Types.ObjectId().toHexString(),
  });

  await ticket.save();

  // create a fake data event
  const data: OrderCreatedEvent["data"] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    userId: ticket.userId,
    expiresAt: "jsjsj",
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

it("sets the orderId for the ticket ", async () => {
  const { listener, data, msg, ticket } = await setup();
  // call the onMessage function with the data object + message object
  await listener.onMessage(data, msg);
  // write assertions to make sure a ticket was created
  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket!.orderId).toEqual(data.id);
});

it("acks the message", async () => {
  const { listener, data, msg } = await setup();
  // call the onMessage function with the data object + message object
  await listener.onMessage(data, msg);
  // write assertions to make sure ack function is called
  expect(msg.ack).toHaveBeenCalled();
});
it("publishes a ticket updated event", async () => {
  const { listener, data, msg } = await setup();
  // call the onMessage function with the data object + message object
  await listener.onMessage(data, msg);
  // write assertions to make sure ack function is called
  expect(natsWrapper.client.publish).toHaveBeenCalled();

  const ticketUpdatedData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[2][1]);

  expect(data.id).toEqual(ticketUpdatedData.orderId);
});
