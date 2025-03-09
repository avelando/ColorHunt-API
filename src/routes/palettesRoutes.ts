import express from "express";
import {
  createPalette,
  getUserPalettes,
  getPalette,
  updatePalette,
  deletePalette,
} from "../controllers/paletteController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/upload", authMiddleware as any, createPalette);
router.get("/user", authMiddleware as any, getUserPalettes);
router.get("/:paletteId", authMiddleware as any, getPalette);
router.patch("/:paletteId", authMiddleware as any, updatePalette);
router.delete("/:paletteId", authMiddleware as any, deletePalette);

export default router;
