import { Request, Response } from "express";
import { saveColors } from "../services/colorService";
import { extractPaletteFromImage } from "../utils/imageUtils";
import { getPhotoById } from "../services/photoService";
import cloudinary from "../config/cloudinary";
import prisma from "../config/prismaClient";

export const uploadPhoto = async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).userId;

  if (!userId) {
    res.status(400).json({ error: "User ID is missing or invalid" });
    return;
  }

  if (!req.file) {
    res.status(400).json({ error: "No image file uploaded" });
    return;
  }

  try {
    const { title, isPublic } = req.body;

    cloudinary.uploader.upload_stream(
      { folder: "colorhunt", resource_type: "image" },
      async (error, result) => {
        if (error || !result) {
          res.status(500).json({ error: "Cloudinary upload failed" });
          return;
        }

        console.log("✅ Imagem enviada para Cloudinary:", result.secure_url);

        const photo = await prisma.photo.create({
          data: {
            userId,
            imageUrl: result.secure_url,
          },
        });

        console.log("📷 Foto salva no banco com ID:", photo.id);

        // ✅ Extração de cores imediatamente após o upload
        const palette = await extractPaletteFromImage(result.secure_url);

        if (!palette || palette.length !== 5) {
          res.status(500).json({ error: "Failed to extract a valid 5-color palette" });
          return;
        }

        console.log("🎨 Paleta extraída:", palette);

        await saveColors(photo.id, palette);

        res.status(201).json({ message: "Photo uploaded and palette generated successfully", photo, palette });
      }
    ).end(req.file.buffer);
  } catch (error) {
    console.error("❌ Erro ao processar upload:", error);
    res.status(500).json({ error: "Error processing upload", details: error });
  }
};

export const getPalette = async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).userId;
  const photoId = parseInt(req.params.photoId);

  if (!userId || isNaN(photoId)) {
    res.status(400).json({ error: "Invalid user ID or photo ID" });
    return;
  }

  try {
    const photo = await getPhotoById(photoId, userId);

    if (!photo) {
      res.status(403).json({ message: "Unauthorized or photo not found" });
      return;
    }

    const palette = photo.colors.map((color: { hex: any; }) => color.hex);
    res.status(200).json({ palette });
  } catch (error) {
    res.status(500).json({ error: "Error fetching palette", details: error });
  }
};
