import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../app";
import User from "../models/User";
import Category from "../models/Category";

let mongoServer: MongoMemoryServer;
let primaryToken: string;
let userToken: string;
let categoryId: string;
let productId: string;

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

  // Create a category
  const category = await Category.create({
    name: "Electronics",
  });
  categoryId = (category as any)._id.toString();
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongoServer.stop();
});

describe("Product API", () => {
  describe("POST /api/products", () => {
    it("should create a product as authenticated user", async () => {
      const response = await request(app)
        .post("/api/products")
        .set("Authorization", `Bearer ${primaryToken}`)
        .send({
          name: "Laptop",
          sku: "LAP-001",
          description: "High performance laptop",
          quantity: 10,
          price: 999.99,
          category: categoryId,
        });

      expect(response.status).toBe(201);
      expect(response.body.name).toBe("Laptop");
      expect(response.body.sku).toBe("LAP-001");
      productId = response.body._id;
    });

    it("should not create product without required fields", async () => {
      const response = await request(app)
        .post("/api/products")
        .set("Authorization", `Bearer ${primaryToken}`)
        .send({
          name: "Phone",
        });

      expect(response.status).toBe(400);
    });

    it("should create product as another authenticated user", async () => {
      const response = await request(app)
        .post("/api/products")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          name: "Tablet",
          sku: "TAB-001",
          price: 499.99,
        });

      expect(response.status).toBe(201);
      expect(response.body.name).toBe("Tablet");
      expect(response.body.sku).toBe("TAB-001");
    });

    it("should not create product without authentication", async () => {
      const response = await request(app).post("/api/products").send({
        name: "Mouse",
        sku: "MOU-001",
        price: 29.99,
      });

      expect(response.status).toBe(401);
    });
  });

  describe("GET /api/products", () => {
    it("should get all products with authentication", async () => {
      const response = await request(app)
        .get("/api/products")
        .set("Authorization", `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.pagination).toBeDefined();
    });

    it("should filter products by search query", async () => {
      const response = await request(app)
        .get("/api/products?search=Laptop")
        .set("Authorization", `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it("should not get products without authentication", async () => {
      const response = await request(app).get("/api/products");

      expect(response.status).toBe(401);
    });
  });

  describe("PUT /api/products/:id", () => {
    it("should update a product as authenticated user", async () => {
      const response = await request(app)
        .put(`/api/products/${productId}`)
        .set("Authorization", `Bearer ${primaryToken}`)
        .send({
          name: "Updated Laptop",
          price: 899.99,
        });

      expect(response.status).toBe(200);
      expect(response.body.name).toBe("Updated Laptop");
    });

    it("should update product as another authenticated user", async () => {
      const response = await request(app)
        .put(`/api/products/${productId}`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          name: "Hacked Laptop",
        });

      expect(response.status).toBe(200);
      expect(response.body.name).toBe("Hacked Laptop");
    });

    it("should return 404 for non-existent product", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .put(`/api/products/${fakeId}`)
        .set("Authorization", `Bearer ${primaryToken}`)
        .send({
          name: "Test",
        });

      expect(response.status).toBe(404);
    });
  });

  describe("DELETE /api/products/:id", () => {
    it("should delete a product as authenticated user", async () => {
      const response = await request(app)
        .delete(`/api/products/${productId}`)
        .set("Authorization", `Bearer ${primaryToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Product deleted successfully");
    });

    it("should delete product as another authenticated user", async () => {
      // Create another product first
      const createResponse = await request(app)
        .post("/api/products")
        .set("Authorization", `Bearer ${primaryToken}`)
        .send({
          name: "Test Product",
          sku: "TEST-001",
          price: 99.99,
          quantity: 5,
        });

      const response = await request(app)
        .delete(`/api/products/${createResponse.body._id}`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(response.status).toBe(200);
    });

    it("should return 404 for non-existent product", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .delete(`/api/products/${fakeId}`)
        .set("Authorization", `Bearer ${primaryToken}`);

      expect(response.status).toBe(404);
    });
  });
});
