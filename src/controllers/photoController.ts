import { Request, Response } from "express";
import { saveColors } from "../services/colorService";
import { extractPaletteFromImage } from "../utils/imageUtils";
import { getPhotoById } from "../services/photoService";
import prisma from "../config/prismaClient";

export const uploadPhoto = async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).userId;

  if (!userId) {
    res.status(400).json({ error: "User ID is missing or invalid" });
    return;
  }

  const { imageUrl, title, isPublic } = req.body;

  if (!imageUrl) {
    res.status(400).json({ error: "No image URL provided" });
    return;
  }

  try {
    console.log("✅ Imagem recebida:", imageUrl);

    const photo = await prisma.photo.create({
      data: {
        userId,
        imageUrl,
        title: title || "Minha Imagem",
        isPublic: isPublic === "true",
      },
    });

    console.log("📷 Foto salva no banco com ID:", photo.id);

    const palette = await extractPaletteFromImage(imageUrl);

    if (!palette || palette.length !== 5) {
      res.status(500).json({ error: "Failed to extract a valid 5-color palette" });
      return;
    }

    console.log("🎨 Paleta extraída:", palette);

    // 🔹 Salvar cores no banco de dados
    await saveColors(photo.id, palette);

    res.status(201).json({ message: "Photo uploaded and palette generated successfully", photo, palette });
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
