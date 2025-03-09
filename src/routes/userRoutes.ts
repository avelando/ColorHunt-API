import express from "express";
import { getUser, updateUser, deleteUser } from "../controllers/userController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/me", authMiddleware as any, getUser);
router.put("/me", authMiddleware as any, updateUser);
router.delete("/me", authMiddleware as any, deleteUser);

export default router;
