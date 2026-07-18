import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../app";
import User from "../models/User";

let mongoServer: MongoMemoryServer;
let primaryToken: string;
let userToken: string;

process.env.JWT_SECRET = "test-secret";

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  // Create first user
  await request(app).post("/api/auth/register").send({
    name: "First User",
    email: "user1@test.com",
    password: "user123",
  });

  // Login first user
  const primaryLogin = await request(app).post("/api/auth/login").send({
    email: "user1@test.com",
    password: "user123",
  });
  primaryToken = primaryLogin.body.token;

  // Create second user
  const userResponse = await request(app).post("/api/auth/register").send({
    name: "Second User",
    email: "user2@test.com",
    password: "user123",
  });
  userToken = userResponse.body.token;
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongoServer.stop();
});

describe("Category API", () => {
  describe("POST /api/categories", () => {
    it("should create a category as authenticated user", async () => {
      const response = await request(app)
        .post("/api/categories")
        .set("Authorization", `Bearer ${primaryToken}`)
        .send({
          name: "Electronics",
        });

      expect(response.status).toBe(201);
      expect(response.body.name).toBe("Electronics");
    });

    it("should create category as authenticated user", async () => {
      const response = await request(app)
        .post("/api/categories")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          name: "Books",
        });

      expect(response.status).toBe(201);
      expect(response.body.name).toBe("Books");
    });

    it("should not create category without authentication", async () => {
      const response = await request(app).post("/api/categories").send({
        name: "Furniture",
      });

      expect(response.status).toBe(401);
    });
  });

  describe("GET /api/categories", () => {
    it("should get all categories with authentication", async () => {
      const response = await request(app)
        .get("/api/categories")
        .set("Authorization", `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it("should not get categories without authentication", async () => {
      const response = await request(app).get("/api/categories");

      expect(response.status).toBe(401);
    });
  });
});
