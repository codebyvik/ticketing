import { natsWrapper } from "../../../nats-wrapper";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../../models/ticket";
import { TicketUpdatedListener } from "../ticket-updated-listener";
import { TicketUpdatedEvent } from "@cbvticketss/common";

const setup = async () => {
  // create an instance of the listener
  const listener = new TicketUpdatedListener(natsWrapper.client);
  // create and save a ticket
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "concert",
    price: 20,
  });
  await ticket.save();

  //   Create a fake data object
  const data: TicketUpdatedEvent["data"] = {
    version: ticket.version + 1,
    id: ticket.id,
    title: "new concert",
    price: 200,
    userId: new mongoose.Types.ObjectId().toHexString(),
    orderId: "",
  };
  // create a fake message object
  //   @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, ticket, data, msg };
};

it("finds , updates and saves a ticket", async () => {
  const { listener, data, msg, ticket } = await setup();
  // call the onMessage function with the data object + message object
  await listener.onMessage(data, msg);
  // write assertions to make sure a ticket was created
  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket!.title).toEqual(data.title);
  expect(updatedTicket!.version).toEqual(data.version);
  expect(updatedTicket!.price).toEqual(data.price);
});

it("acks the message", async () => {
  const { listener, data, msg } = await setup();
  // call the onMessage function with the data object + message object
  await listener.onMessage(data, msg);
  // write assertions to make sure ack function is called
  expect(msg.ack).toHaveBeenCalled();
});
it("doesn't call ack if the event has a skipped version number", async () => {
  const { listener, data, msg } = await setup();
  data.version = 10;
  // call the onMessage function with the data object + message object

  await expect(listener.onMessage(data, msg)).rejects.toThrow();
  // write assertions to make sure ack function is called
  expect(msg.ack).not.toHaveBeenCalled();
});
