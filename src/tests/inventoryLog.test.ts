import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../app";
import User from "../models/User";
import Product from "../models/Product";
import InventoryLog from "../models/InventoryLog";

let mongoServer: MongoMemoryServer;
let userToken: string;
let userId: string;
let productId: string;

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

  // Get user ID
  const user = await User.findOne({ email: "user@test.com" });
  userId = user!._id.toString();

  // Create a product
  const product = await Product.create({
    name: "Test Product",
    sku: "TEST-001",
    price: 99.99,
    quantity: 50,
  });
  productId = product._id.toString();

  // Create some inventory logs (older first)
  await InventoryLog.create({
    product: productId,
    action: "UPDATE",
    previousQuantity: 30,
    newQuantity: 40,
    changedBy: userId,
  });

  // Wait a moment to ensure different timestamps
  await new Promise((resolve) => setTimeout(resolve, 10));

  await InventoryLog.create({
    product: productId,
    action: "UPDATE",
    previousQuantity: 40,
    newQuantity: 50,
    changedBy: userId,
  });
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongoServer.stop();
});

describe("Inventory Log API", () => {
  describe("GET /api/inventory-logs", () => {
    it("should get all inventory logs with authentication", async () => {
      const response = await request(app)
        .get("/api/inventory-logs")
        .set("Authorization", `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);

      // Verify log structure
      const log = response.body[0];
      expect(log._id).toBeDefined();
      expect(log.product).toBeDefined();
      expect(log.action).toBeDefined();
      expect(log.previousQuantity).toBeDefined();
      expect(log.newQuantity).toBeDefined();
      expect(log.changedBy).toBeDefined();
    });

    it("should return logs in descending order by createdAt", async () => {
      const response = await request(app)
        .get("/api/inventory-logs")
        .set("Authorization", `Bearer ${userToken}`);

      expect(response.status).toBe(200);

      // Most recent log should have newQuantity 50
      expect(response.body[0].newQuantity).toBe(50);
      // Older log should have newQuantity 40
      expect(response.body[1].newQuantity).toBe(40);
    });

    it("should not get inventory logs without authentication", async () => {
      const response = await request(app).get("/api/inventory-logs");

      expect(response.status).toBe(401);
    });
  });
});
