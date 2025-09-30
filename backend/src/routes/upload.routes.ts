import { Router } from "express";
import multer from "multer";
import { validateImage } from "../middlewares/validateImage";
import { uploadImage } from "../controllers/upload.controller";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/upload", upload.single("image"), validateImage, uploadImage);

export default router;
