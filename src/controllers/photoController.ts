import { Request, Response } from "express";
import { savePhoto, getPhotoById } from "../services/photoService";
import { saveColors, extractPaletteFromColors } from "../services/colorService";
import { extractPaletteFromImage } from "../utils/imageUtils";

export const uploadPhoto = async (req: Request, res: Response): Promise<void> => {
  const userId = req.userId;

  if (!userId) {
    res.status(400).json({ error: "User ID is missing or invalid" });
    return;
  }

  const { imageUrl } = req.body;

  if (!imageUrl) {
    res.status(400).json({ error: "Image URL is required" });
    return;
  }

  try {
    const photo = await savePhoto(userId, imageUrl);
    res.status(201).json({ message: "Photo saved successfully", photo });
  } catch (error) {
    res.status(500).json({ error: "Error saving photo" });
  }
};

export const generatePalette = async (req: Request, res: Response): Promise<void> => {
  const userId = req.userId;

  if (!userId) {
    res.status(400).json({ error: "User ID is missing or invalid" });
    return;
  }

  const photoId = parseInt(req.params.photoId);

  if (isNaN(photoId)) {
    res.status(400).json({ error: "Photo ID is invalid" });
    return;
  }

  try {
    const photo = await getPhotoById(photoId, userId);

    if (!photo) {
      res.status(403).json({ message: "Unauthorized or photo not found" });
      return;
    }

    const palette = await extractPaletteFromImage(photo.imageUrl);
    await saveColors(photo.id, palette);

    res.status(201).json({ message: "Palette generated successfully", palette });
  } catch (error) {
    res.status(500).json({ error: "Error generating palette" });
  }
};

export const getPalette = async (req: Request, res: Response): Promise<void> => {
  const userId = req.userId;

  if (!userId) {
    res.status(400).json({ error: "User ID is missing or invalid" });
    return;
  }

  const photoId = parseInt(req.params.photoId);

  if (isNaN(photoId)) {
    res.status(400).json({ error: "Photo ID is invalid" });
    return;
  }

  try {
    const photo = await getPhotoById(photoId, userId);

    if (!photo) {
      res.status(403).json({ message: "Unauthorized or photo not found" });
      return;
    }

    const palette = extractPaletteFromColors(photo.colors);
    res.status(200).json({ palette });
  } catch (error) {
    res.status(500).json({ error: "Error fetching palette" });
  }
};
