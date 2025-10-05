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

const router = Router();

router.post("/products", adminAuth, upload.single("image"), createProduct);

router.post("/products/:id/image", adminAuth, upload.single("image"), createProduct);

router.put("/products/:id/stock", adminAuth, updateProductStock);

router.get("/products/active", adminAuth, getActiveProducts);

router.get("/products", adminAuth, getAllProducts);

router.get("/dashboard", adminAuth, getDashboard);

export default router;
