import { Router } from "express";
import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserDeleteConfirmation,
  forgotPassword,
  resetPassword,
} from "../controllers/user.controller";
import { register } from "../controllers/auth.controller";
import { authenticate, isAdmin } from "../middlewares/auth.middleware";
import { forgotPasswordLimiter } from "../middlewares/rateLimiter";

const router = Router();

// 🔹 CRUD de Usuários
router.post("/", register);
router.get("/", authenticate, isAdmin, getUsers);
router.get("/:id", authenticate, isAdmin, getUserById);
router.put("/:id", authenticate, isAdmin, updateUser);

// 🔹 Confirmação e deleção de usuário
router.get("/:id/confirm-delete", authenticate, isAdmin, getUserDeleteConfirmation);
router.delete("/:id", authenticate, isAdmin, deleteUser);

// 🔹 Reset de senha
router.post("/forgot-password", forgotPassword);
router.post("/forgot-password", forgotPasswordLimiter, forgotPassword);
export default router;
