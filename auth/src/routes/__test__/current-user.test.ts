import { app } from "../../app";
import request from "supertest";
it("should return curent user", async () => {
  const cookie = await global.signin();

  const response = await request(app)
    .get("/api/users/currentuser")
    .set("Cookie", cookie)
    .send()
    .expect(200);

  expect(response.body.currentUser.email).toEqual("test@test.com");
});

it("responds with null if not authenticated", async () => {
  await request(app).get("/api/users/currentuser").send().expect(401);
});
