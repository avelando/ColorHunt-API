import express from "express";
import { uploadPhoto, generatePalette, getPalette } from "../controllers/photoController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/", authMiddleware, uploadPhoto);
router.post("/:photoId/palette", authMiddleware, generatePalette);
router.get("/:photoId/palette", authMiddleware, getPalette);

export default router;
