import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../app";
import User from "../models/User";

let mongoServer: MongoMemoryServer;
let adminToken: string;
let userToken: string;

process.env.JWT_SECRET = "test-secret";

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  // Create admin user
  await request(app).post("/api/auth/register").send({
    name: "Admin User",
    email: "admin@test.com",
    password: "admin123",
  });

  // Update user to admin role
  await User.findOneAndUpdate({ email: "admin@test.com" }, { role: "admin" });

  // Login to get token with admin role
  const adminLogin = await request(app).post("/api/auth/login").send({
    email: "admin@test.com",
    password: "admin123",
  });
  adminToken = adminLogin.body.token;

  // Create regular user
  const userResponse = await request(app).post("/api/auth/register").send({
    name: "Regular User",
    email: "user@test.com",
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
    it("should create a category as admin", async () => {
      const response = await request(app)
        .post("/api/categories")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Electronics",
        });

      expect(response.status).toBe(201);
      expect(response.body.name).toBe("Electronics");
    });

    it("should not create category as regular user", async () => {
      const response = await request(app)
        .post("/api/categories")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          name: "Books",
        });

      expect(response.status).toBe(403);
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
