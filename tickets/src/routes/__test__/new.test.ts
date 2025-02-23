import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../../models/ticket";
import { natsWrapper } from "../../nats-wrapper";
it("has a route handler /api/tickets for post requests", async () => {
  const response = await request(app).post("/api/tickets").send({});

  expect(response.status).not.toEqual(404);
});
it("can only be accessed if the user is signed in", async () => {
  const response = await request(app).post("/api/tickets").send({});

  expect(response.status).toEqual(401);
});
it("returns other than 401 if the user is signed in", async () => {
  const cookie = global.signin();
  const response = await request(app).post("/api/tickets").set("Cookie", cookie).send({});

  expect(response.status).not.toEqual(401);
});
it("it returns an error if an invalid title is provided", async () => {
  await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({ title: "", price: 10 })
    .expect(400);

  await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({ price: 10 })
    .expect(400);
});
it("it returns an error if an invalid price is provided", async () => {
  await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({ title: "hey", price: -10 })
    .expect(400);

  await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({ title: "ssksk" })
    .expect(400);
});
it("creates a ticket with valid inputs", async () => {
  let tickets = await Ticket.find({});

  expect(tickets.length).toEqual(0);

  let title = "test";
  await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({ title, price: 20 })
    .expect(201);

  tickets = await Ticket.find({});

  expect(tickets.length).toEqual(1);
  expect(tickets[0].price).toEqual(20);
  expect(tickets[0].title).toEqual(title);
});

it("publishes an event", async () => {
  let title = "test";
  await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({ title, price: 20 })
    .expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
