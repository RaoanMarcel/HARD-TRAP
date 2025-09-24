import { Router } from "express";
import { authMiddleware, authorize } from "../middlewares/auth.middleware";

const router = Router();

router.get("/me", authMiddleware, (req, res) => {
  res.json({ message: "Você está autenticado!", user: (req as any).user });
});

router.get("/admin", authMiddleware, authorize(["ADMIN"]), (req, res) => {
  res.json({ message: "Bem-vindo, admin!" });
});

export default router;
