import express from "express";
import { uploadPhoto, getPalette } from "../controllers/photoController";
import { authMiddleware } from "../middleware/authMiddleware";
import upload from "../middleware/upload";

const router = express.Router();

router.post("/upload", authMiddleware as any, upload.single("image"), uploadPhoto);
router.get("/:photoId/palette", authMiddleware as any, getPalette);

export default router;
