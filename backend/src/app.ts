import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { stripeWebhook } from "./webhook/stripeWebhook";

dotenv.config();

const app = express();
const prisma = new PrismaClient();

app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhook
);

app.use(cors());
app.use(express.json()); 

import authRoutes from "./routes/auth.routes";
import protectedRoutes from "./routes/protected.routes";
import productRoutes from "./routes/product.routes";
import userRoutes from "./routes/user.routes";
import orderRoutes from "./routes/order.routes";
import shippingRoutes from "./routes/shipping.routes";

app.use("/auth", authRoutes);
app.use("/protected", protectedRoutes);
app.use("/products", productRoutes);
app.use("/users", userRoutes);
app.use("/orders", orderRoutes);
app.use("/shipping", shippingRoutes);

export default app;
