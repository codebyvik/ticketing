import request from "supertest";
import { app } from "../../app";
import mongoose from "mongoose";
import { natsWrapper } from "../../nats-wrapper";
import { Ticket } from "../../models/ticket";

it("returns a 404 if the provided id does not exist", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();

  await request(app)
    .put(`/api/tickets/${id}`)
    .set("Cookie", global.signin())
    .send({
      title: "hshshs",
      price: 20,
    })
    .expect(404);
});
it("returns a 401 if the user is not authenticated", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();

  await request(app)
    .put(`/api/tickets/${id}`)
    .send({
      title: "hshshs",
      price: 20,
    })
    .expect(401);
});
it("returns a  401 if the user doesn't own the ticket", async () => {
  let title = "test";
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({ title, price: 20 })
    .expect(201);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", global.signin())
    .send({
      title: "hshshs",
      price: 22,
    })
    .expect(401);
});
it("returns a 400 if the user provides an invalid title or price", async () => {
  let title = "test";
  const cookie = global.signin();
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({ title, price: 20 })
    .expect(201);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "",
      price: 22,
    })
    .expect(400);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "hshs",
      price: -10,
    })
    .expect(400);
});

it("it updates the ticket provided valid inputs", async () => {
  let title = "test";
  const cookie = global.signin();
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({ title, price: 20 })
    .expect(201);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "new title",
      price: 100,
    })
    .expect(200);

  const ticketResponse = await request(app).get(`/api/tickets/${response.body.id}`).send();

  expect(ticketResponse.body.price).toEqual(100);
  expect(ticketResponse.body.title).toEqual("new title");
});

it("publishes an event", async () => {
  let title = "test";
  const cookie = global.signin();
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({ title, price: 20 })
    .expect(201);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "new title",
      price: 100,
    })
    .expect(200);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it("it rejects if the ticket is reserved", async () => {
  let title = "test";
  const cookie = global.signin();
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({ title, price: 20 })
    .expect(201);

  const ticket = await Ticket.findById(response.body.id);

  ticket!.set({ orderId: new mongoose.Types.ObjectId().toHexString() });

  await ticket!.save();

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "new title",
      price: 100,
    })
    .expect(400);
});
