import request from "supertest";

import mongoose from "mongoose";

import { MongoMemoryServer } from "mongodb-memory-server";

import app from "../app";

let mongoServer: MongoMemoryServer;

process.env.JWT_SECRET = "test-secret";

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();

  const uri = mongoServer.getUri();

  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.connection.close();

  await mongoServer.stop();
});

describe("Auth API", () => {
  it("should register a user", async () => {
    const response = await request(app).post("/api/auth/register").send({
      name: "Test User",
      email: "test@example.com",
      password: "password123",
    });

    expect(response.status).toBe(201);

    expect(response.body.token).toBeDefined();
  });
});
