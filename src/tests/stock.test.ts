import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../app";
import User from "../models/User";
import Product from "../models/Product";

let mongoServer: MongoMemoryServer;
let adminToken: string;
let userToken: string;
let productId: string;

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

  // Create a product
  const product = await Product.create({
    name: "Test Product",
    sku: "TEST-001",
    price: 99.99,
    quantity: 50,
  });
  productId = product._id.toString();
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongoServer.stop();
});

describe("Stock API", () => {
  describe("POST /api/stock/:id", () => {
    it("should add stock (IN) as admin", async () => {
      const response = await request(app)
        .post(`/api/stock/${productId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          type: "IN",
          quantity: 20,
        });

      expect(response.status).toBe(200);
      expect(response.body.previousQuantity).toBe(50);
      expect(response.body.currentQuantity).toBe(70);
    });

    it("should remove stock (OUT) as admin", async () => {
      const response = await request(app)
        .post(`/api/stock/${productId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          type: "OUT",
          quantity: 10,
        });

      expect(response.status).toBe(200);
      expect(response.body.previousQuantity).toBe(70);
      expect(response.body.currentQuantity).toBe(60);
    });

    it("should not allow insufficient stock removal", async () => {
      const response = await request(app)
        .post(`/api/stock/${productId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          type: "OUT",
          quantity: 1000,
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Insufficient stock");
    });

    it("should not update stock as regular user", async () => {
      const response = await request(app)
        .post(`/api/stock/${productId}`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          type: "IN",
          quantity: 5,
        });

      expect(response.status).toBe(403);
    });

    it("should not update stock without authentication", async () => {
      const response = await request(app).post(`/api/stock/${productId}`).send({
        type: "IN",
        quantity: 5,
      });

      expect(response.status).toBe(401);
    });

    it("should return 404 for non-existent product", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .post(`/api/stock/${fakeId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          type: "IN",
          quantity: 5,
        });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Product not found");
    });
  });
});
