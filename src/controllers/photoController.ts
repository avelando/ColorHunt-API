import { Request, Response } from "express";
import prisma from "../config/prismaClient";
import { extractPaletteFromImage } from "../utils/imageUtils";

export const uploadPhoto = async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).userId;
  const { imageUrl, title, isPublic } = req.body;
  if (!userId) {
    res.status(400).json({ error: "User ID is missing or invalid" });
    return;
  }
  if (!imageUrl) {
    res.status(400).json({ error: "No image URL provided" });
    return;
  }
  try {
    const photo = await prisma.photo.create({
      data: {
        userId,
        imageUrl,
      },
    });
    console.log("📷 Foto salva no banco com ID:", photo.id);

    const extractedColors = await extractPaletteFromImage(imageUrl);
    if (!extractedColors || extractedColors.length !== 5) {
      res.status(500).json({ error: "Failed to extract a valid 5-color palette" });
      return;
    }
    console.log("🎨 Paleta extraída:", extractedColors);

    const palette = await prisma.palette.create({
      data: {
        userId,
        photoId: photo.id,
        title: title || "Minha Paleta",
        isPublic: isPublic === "true" || isPublic === true,
      },
    });

    const colorData = extractedColors.map((hex: string) => ({
      hex,
      paletteId: palette.id,
      photoId: photo.id,
    }));    
    await prisma.color.createMany({ data: colorData });

    const createdPalette = await prisma.palette.findUnique({
      where: { id: palette.id },
      include: { photo: true, colors: true },
    });
    res.status(201).json({
      message: "Photo uploaded and palette generated successfully",
      photo,
      palette: createdPalette,
    });
  } catch (error) {
    console.error("❌ Erro ao processar upload:", error);
    res.status(500).json({ error: "Error processing upload", details: error });
  }
};

export const getPalette = async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).userId;
  const photoId = parseInt(req.params.photoId, 10);

  if (!userId || isNaN(photoId)) {
    res.status(400).json({ error: "Invalid user ID or photo ID" });
    return;
  }

  try {
    const photo = await prisma.photo.findFirst({
      where: { id: photoId, userId },
      include: { palette: { include: { colors: true } } },
    });

    if (!photo || !photo.palette) {
      res.status(403).json({ message: "Unauthorized or photo/palette not found" });
      return;
    }

    const paletteColors = photo.palette.colors.map((color) => color.hex);
    res.status(200).json({ palette: paletteColors });
  } catch (error) {
    console.error("Erro ao buscar paleta:", error);
    res.status(500).json({ error: "Error fetching palette", details: error });
  }
};

export const getUserPhotos = async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).userId;
  if (!userId) {
    res.status(400).json({ error: "User ID is missing or invalid" });
    return;
  }
  try {
    const photos = await prisma.photo.findMany({
      where: { userId },
      include: { palette: { include: { colors: true } } },
    });

    res.status(200).json({ photos });
  } catch (error) {
    console.error("❌ Erro ao buscar fotos:", error);
    res.status(500).json({ error: "Error fetching photos", details: error });
  }
};

export const deletePhoto = async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).userId;
  const photoId = parseInt(req.params.photoId, 10);
  if (!userId || isNaN(photoId)) {
    res.status(400).json({ error: "Invalid user ID or photo ID" });
    return;
  }
  try {
    const photo = await prisma.photo.findUnique({ where: { id: photoId } });
    if (!photo) {
      res.status(404).json({ error: "Photo not found" });
      return;
    }
    if (photo.userId !== userId) {
      res.status(403).json({ error: "Not authorized to delete this photo" });
      return;
    }
    await prisma.photo.delete({ where: { id: photoId } });
    res.status(200).json({ message: "Photo deleted successfully" });
  } catch (error) {
    console.error("Error deleting photo:", error);
    res.status(500).json({ error: "Error deleting photo", details: error });
  }
};
