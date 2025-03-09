import express from "express";
import { updateColor } from "../controllers/colorController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

router.patch("/:colorId", authMiddleware as any, updateColor);

export default router;
