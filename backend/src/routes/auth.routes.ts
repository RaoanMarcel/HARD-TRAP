import { Router } from "express";
import { register, login } from "../controllers/auth.controller";
import { loginLimiter } from "../middlewares/rateLimiter";

const router = Router();

router.post("/register", register);
router.post("/login", loginLimiter, login); 

export default router;
