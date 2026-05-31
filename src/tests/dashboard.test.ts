import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../app";
import Product from "../models/Product";

let mongoServer: MongoMemoryServer;
let userToken: string;

process.env.JWT_SECRET = "test-secret";

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  // Create user
  const userResponse = await request(app).post("/api/auth/register").send({
    name: "Test User",
    email: "user@test.com",
    password: "user123",
  });
  userToken = userResponse.body.token;

  // Create test products
  await Product.create([
    {
      name: "Product 1",
      sku: "P1",
      price: 100,
      quantity: 5,
    },
    {
      name: "Product 2",
      sku: "P2",
      price: 200,
      quantity: 15,
    },
    {
      name: "Product 3",
      sku: "P3",
      price: 50,
      quantity: 3,
    },
  ]);
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongoServer.stop();
});

describe("Dashboard API", () => {
  describe("GET /api/dashboard", () => {
    it("should get dashboard stats with authentication", async () => {
      const response = await request(app)
        .get("/api/dashboard")
        .set("Authorization", `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.totalProducts).toBeDefined();
      expect(response.body.lowStockProducts).toBeDefined();
      expect(response.body.totalInventoryValue).toBeDefined();
      expect(response.body.recentActivity).toBeDefined();

      // Verify counts
      expect(response.body.totalProducts).toBe(3);
      expect(response.body.lowStockProducts).toBe(2); // Products with qty < 10

      // Verify total inventory value calculation
      // P1: 100 * 5 = 500, P2: 200 * 15 = 3000, P3: 50 * 3 = 150
      // Total = 3650
      expect(response.body.totalInventoryValue).toBe(3650);

      // Verify recent activity is an array
      expect(Array.isArray(response.body.recentActivity)).toBe(true);
    });

    it("should not get dashboard stats without authentication", async () => {
      const response = await request(app).get("/api/dashboard");

      expect(response.status).toBe(401);
    });
  });
});
