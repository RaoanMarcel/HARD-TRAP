import { Router } from "express";
import {
  createProduct,
  getProducts,
  getProductById,
  updateStock, 
  deleteProduct,
  uploadProductImage,
} from "../controllers/product.controller";
import { upload } from "../middlewares/upload.middleware";
import { authenticate, isAdmin } from "../middlewares/auth.middleware";

const router = Router();


router.get("/", getProducts);
router.get("/:id", getProductById);

router.post("/", authenticate, isAdmin, createProduct);
router.put("/:id", authenticate, isAdmin, updateStock); 
router.delete("/:id", authenticate, isAdmin, deleteProduct);

// Image upload endpoint
router.post("/upload-image", authenticate, isAdmin, upload.single("image"), uploadProductImage);

export default router;
