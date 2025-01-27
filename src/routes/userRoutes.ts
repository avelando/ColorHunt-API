import express from "express";
import { register, login, getUser, updateUser, deleteUser } from "../controllers/userController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authMiddleware, getUser);
router.put("/me", authMiddleware, updateUser);
router.delete("/me", authMiddleware, deleteUser);

export default router;
