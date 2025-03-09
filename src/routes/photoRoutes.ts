import express from "express";
import { uploadPhoto, getPalette } from "../controllers/photoController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/upload", authMiddleware as any, uploadPhoto);
router.get("/:photoId/palette", authMiddleware as any, getPalette);

export default router;
