import { Router } from "express";
import { adminAuth } from "../middlewares/adminAuth.middleware";
import { upload } from "../middlewares/upload.middleware";
import {
  createProduct,
  updateProductStock,
  getActiveProducts,
  getAllProducts
} from "../controllers/admin.controller";
import { getDashboard } from "../controllers/adminDashboard.controller";
import { getUsers, getUserById, updateUser, deleteUser } from "../controllers/adminUser.controller";
import { getOrders, getOrderById, updateOrderStatus } from "../controllers/adminOrders.controller";
import { getPayments, getPaymentById, updatePaymentStatus } from "../controllers/adminPayments.controller";

const router = Router();

router.post("/products", adminAuth, upload.single("image"), createProduct);

router.post("/products/:id/image", adminAuth, upload.single("image"), createProduct);

router.put("/products/:id/stock", adminAuth, updateProductStock);

router.get("/products/active", adminAuth, getActiveProducts);

router.get("/products", adminAuth, getAllProducts);

router.get("/dashboard", adminAuth, getDashboard);

router.get("/users", adminAuth, getUsers);

router.get("/users/:id", adminAuth, getUserById);

router.put("/users/:id", adminAuth, updateUser);

router.delete("/users/:id", adminAuth, deleteUser);

router.get("/orders", adminAuth, getOrders);

router.get("/orders/:id", adminAuth, getOrderById);

router.put("/orders/:id/status", adminAuth, updateOrderStatus);

router.get("/payments", getPayments);

router.get("/payments/:id", getPaymentById);

router.put("/payments/:id/status", updatePaymentStatus);



export default router;
