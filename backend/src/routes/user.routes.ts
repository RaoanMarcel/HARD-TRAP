import { Router } from "express";
import {
  registerUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  forgotPassword,
  resetPassword,
} from "../controllers/user.controller";

const router = Router();

// CRUD Users
router.post("/", registerUser);       
router.get("/", getUsers);           
router.get("/:id", getUserById);      
router.put("/:id", updateUser);       
router.delete("/:id", deleteUser);    

// Reset de senha
router.post("/forgot-password", forgotPassword); 
router.post("/reset-password", resetPassword);   

export default router;
