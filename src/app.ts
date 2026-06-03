import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import authRoutes from "./routes/authRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import productRoutes from "./routes/productRoutes";
import stockRoutes from "./routes/stockRoutes";
import inventoryLogRoutes from "./routes/inventoryLogRoutes";
import dashboardRoutes from "./routes/dashboardRoutes";
import errorMiddleware from "./middleware/errorMiddleware";
import swaggerUi from "swagger-ui-express";

import swaggerSpec from "./config/swagger";

const app = express();

app.use(cors());
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);
app.use(morgan("dev"));
app.use(express.json());

app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/stock", stockRoutes);
app.use("/api/inventory-logs", inventoryLogRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/", (_req, res) => {
  res.json({
    message: "Inventory System API Running",
  });
});

app.use(errorMiddleware);

export default app;
