import request from "supertest";
import { app } from "../../app";
import mongoose from "mongoose";

it("returns a 404 if the ticket is not found", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app).get(`/api/tickets/${id}`).set("Cookie", global.signin()).send().expect(404);
});
it("returns a ticket if the ticket is  found", async () => {
  const title = "test";
  const price = 20;
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({ title, price: 20 })
    .expect(201);

  const ticketResponse = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .send()
    .expect(200);

  expect(ticketResponse.body.price).toEqual(price);
  expect(ticketResponse.body.title).toEqual(title);
});
