import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Rotas
import authRoutes from "./routes/auth.routes";
import protectedRoutes from "./routes/protected.routes";
import productRoutes from "./routes/product.routes";
import userRoutes from "./routes/user.routes";
import shippingRoutes from "./routes/shipping.routes";
import shopRoutes from "./routes/shop.routes";

// Webhooks
import { handleStripeWebhook } from "./webhook/stripeWebhook";

dotenv.config();

const app = express();

// 🔹 Webhook Stripe precisa receber RAW body
app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  handleStripeWebhook
);

// 🔹 Middlewares globais
app.use(cors());
app.use(express.json());

// 🔹 Rotas da aplicação
app.use("/auth", authRoutes);
app.use("/protected", protectedRoutes);
app.use("/products", productRoutes);
app.use("/users", userRoutes);
app.use("/shipping", shippingRoutes);
app.use("/api/shop", shopRoutes);

export default app;
