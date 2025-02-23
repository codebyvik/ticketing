import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
declare global {
  namespace globalThis {
    function signin(): string[];
  }
}

jest.mock("../nats-wrapper");

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

global.signin = () => {
  //  BUILD a JWT payload , {id , email}
  const id = new mongoose.Types.ObjectId().toHexString();
  const payload = {
    id,
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
