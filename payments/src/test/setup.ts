import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
declare global {
  namespace globalThis {
    function signin(id?: string): string[];
  }
}

jest.mock("../nats-wrapper");

process.env.STRIPE_KEY =
  "sk_test_51IlbAnSCZcZQMjATisBpXIdSVr5nrdPilbMnoQAfqQxTZs5YAN8ie8jiWi3JVG52ACpOFlksRoXbuy0NuFRnki7R00TbvGjYuy";

let mongo: any;
beforeAll(async () => {
  jest.clearAllMocks();
  process.env.JWT_KEY = "asdf";
  mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();

  await mongoose.connect(mongoUri);
});

beforeEach(async () => {
  const collections = await mongoose.connection.db?.collections();

  if (collections) {
    for (let collection of collections) {
      await collection.deleteMany({});
    }
  }
});

afterAll(async () => {
  await mongo.stop();
  await mongoose.connection.close();
});

global.signin = (id?: string) => {
  //  BUILD a JWT payload , {id , email}

  const payload = {
    id: id || new mongoose.Types.ObjectId().toHexString(),
    email: "test@test.com",
  };
  // Create the JWT!
  const jwtToken = jwt.sign(payload, process.env.JWT_KEY!);
  // Build Session Object. {jwt: MY_JWT}
  const session = { jwt: jwtToken };
  // Turn that session into JSON
  const sessionJSON = JSON.stringify(session);
  // Take JSON and encode it as base64
  const base64 = Buffer.from(sessionJSON).toString("base64");
  // return a string thats the cookie with encoded data
  return [`session=${base64}`];
};
