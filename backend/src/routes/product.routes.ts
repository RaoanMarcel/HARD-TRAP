import { Router } from "express";
import {
  createProduct,
  getProducts,
  getProductById,
  updateStock, 
  deleteProduct
} from "../controllers/product.controller";
import { authenticate, isAdmin } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", getProducts);
router.get("/:id", getProductById);

router.post("/", authenticate, isAdmin, createProduct);
router.put("/:id", authenticate, isAdmin, updateStock); 
router.delete("/:id", authenticate, isAdmin, deleteProduct);

export default router;
