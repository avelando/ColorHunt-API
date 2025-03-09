import express from "express";
import { uploadPhoto, getPalette, getUserPhotos } from "../controllers/photoController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/upload", authMiddleware as any, uploadPhoto);
router.get("/:photoId/palette", authMiddleware as any, getPalette);
router.get("/user", authMiddleware as any, getUserPhotos);

export default router;
