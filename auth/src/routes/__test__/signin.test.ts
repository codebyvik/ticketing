import request from "supertest";
import { app } from "../../app";

it("fails when a new email is provided", async () => {
  await request(app)
    .post("/api/users/signin")
    .send({
      email: "test@test.com",
      password: "password",
    })
    .expect(400);
});
it("fails when a incorrect password is provided", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({
      email: "test@test.com",
      password: "password",
    })
    .expect(201);
  await request(app)
    .post("/api/users/signin")
    .send({
      email: "test@test.com",
      password: "passrd",
    })
    .expect(400);
});

it("returns a 200 on a successful signin", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({
      email: "test@test.com",
      password: "password",
    })
    .expect(201);
  await request(app)
    .post("/api/users/signin")
    .send({
      email: "test@test.com",
      password: "password",
    })
    .expect(200);
});

it("returns a 400 with an invalid email", async () => {
  return request(app)
    .post("/api/users/signin")
    .send({
      email: "testcom",
      password: "password",
    })
    .expect(400);
});

it("returns a 400 with an missing email and password", async () => {
  await request(app).post("/api/users/signin").send({ email: "test@test.com" }).expect(400);
  await request(app)
    .post("/api/users/signin")
    .send({
      password: "password",
    })
    .expect(400);
});

it("It sets a cookie after successful signin", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({
      email: "test@test.com",
      password: "password",
    })
    .expect(201);

  const response = await request(app)
    .post("/api/users/signin")
    .send({
      email: "test@test.com",
      password: "password",
    })
    .expect(200);

  expect(response.get("Set-Cookie")).toBeDefined();
});
