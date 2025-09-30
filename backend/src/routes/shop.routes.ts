import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import {
  getCart,
  addToCart,
  removeFromCart,
  checkoutCart,
  createOrder,
  getUserOrders,
  getOrderById,
  createStripePayment
} from "../controllers/shopController";

const router = Router();

router.get("/cart", authMiddleware, getCart);
router.post("/cart", authMiddleware, addToCart);
router.delete("/cart/:itemId", authMiddleware, removeFromCart);
router.post("/cart/checkout", authMiddleware, checkoutCart);

router.post("/orders", authMiddleware, createOrder);
router.get("/orders", authMiddleware, getUserOrders);
router.get("/orders/:id", authMiddleware, getOrderById);

router.post("/orders/stripe", authMiddleware, createStripePayment);

export default router;
