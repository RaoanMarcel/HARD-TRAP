import { Router } from "express";
import { authenticate, isAdmin } from "../middlewares/auth.middleware";
import {
  createOrder,
  getUserOrders,
  getOrderById,
  addItemToOrder,
  removeItemFromOrder,
} from "../controllers/order.controller";
import { createStripePayment } from "../controllers/order.controller";


const router = Router();

router.get("/", authenticate, getUserOrders);

router.get("/:id", authenticate, getOrderById);

router.post("/:id/items", authenticate, addItemToOrder);

router.delete("/:id/items/:itemId", authenticate, removeItemFromOrder);

router.post("/", authenticate, createOrder);

router.post("/stripe", authenticate, createStripePayment);
export default router;
