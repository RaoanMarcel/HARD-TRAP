import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { corsOptions } from "./config/cors.config";

import authRoutes from "./routes/auth.routes";
import protectedRoutes from "./routes/protected.routes";
import productRoutes from "./routes/product.routes";
import userRoutes from "./routes/user.routes";
import shippingRoutes from "./routes/shipping.routes";
import shopRoutes from "./routes/shop.routes";
import { handleStripeWebhook } from "./webhook/stripeWebhook";
import adminRoutes from "./routes/admin.routes";

dotenv.config();

const app = express();

// 🔹 Webhook Stripe precisa receber RAW body
app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  handleStripeWebhook
);

// 🔹 Middlewares globais
app.use(cors(corsOptions));
app.use(express.json());

// 🔹 Rotas
app.use("/auth", authRoutes);
app.use("/protected", protectedRoutes);
app.use("/products", productRoutes);
app.use("/users", userRoutes);
app.use("/shipping", shippingRoutes);
app.use("/api/shop", shopRoutes);

// Admin routes

app.use("/admin", adminRoutes);


export default app;
