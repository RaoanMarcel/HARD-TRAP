import { Router } from "express";
import { calculateShipping } from "../controllers/shipping.controller";

const router = Router();

router.post("/calculate", calculateShipping);

export default router;
