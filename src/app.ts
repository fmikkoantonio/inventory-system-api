import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import authRoutes from "./routes/authRoutes";
import productRoutes from "./routes/productRoutes";
import inventoryLogRoutes from "./routes/inventoryLogRoutes";
import dashboardRoutes from "./routes/dashboardRoutes";
import errorMiddleware from "./middleware/errorMiddleware";

const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/inventory-logs", inventoryLogRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.get("/", (_req, res) => {
  res.json({
    message: "Inventory System API Running",
  });
});

app.use(errorMiddleware);

export default app;
