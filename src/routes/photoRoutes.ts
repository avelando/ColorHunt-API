import express from "express";
import { uploadPhoto, generatePalette, getPalette, getUserPhotos } from "../controllers/photoController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/", authMiddleware, uploadPhoto);
router.post("/:photoId/palette", authMiddleware, generatePalette);
router.get("/:photoId/palette", authMiddleware, getPalette);
router.get("/photos", authMiddleware, getUserPhotos);

export default router;
