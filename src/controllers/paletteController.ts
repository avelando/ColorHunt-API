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
      data: { userId, imageUrl },
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
      include: {
        photo: true,
        colors: true,
        user: { select: { id: true, name: true, username: true, profilePhoto: true } },
      },
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

export const createPalette = async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).userId;
  const { imageUrl, title, isPublic } = req.body;
  if (!userId) {
    res.status(400).json({ error: "User ID missing" });
    return;
  }
  if (!imageUrl) {
    res.status(400).json({ error: "No image URL provided" });
    return;
  }
  try {
    const photo = await prisma.photo.create({
      data: { userId, imageUrl },
    });
    const extractedColors = await extractPaletteFromImage(imageUrl);
    if (!extractedColors || extractedColors.length !== 5) {
      res.status(500).json({ error: "Failed to extract a valid 5-color palette" });
      return;
    }
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
      message: "Palette created successfully",
      palette: createdPalette,
    });
  } catch (error) {
    console.error("Error creating palette:", error);
    res.status(500).json({ error: "Error processing palette creation", details: error });
  }
};

export const getUserPalettes = async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).userId;
  
  if (!userId) {
    res.status(400).json({ error: "User ID missing" });
    return;
  }

  try {
    const palettes = await prisma.palette.findMany({
      where: { userId },
      include: {
        photo: true,
        colors: true,
        user: { select: { id: true, name: true, username: true, profilePhoto: true } },
      },
    });

    res.status(200).json({ palettes });
  } catch (error) {
    console.error("Error fetching palettes:", error);
    res.status(500).json({ error: "Error fetching palettes", details: error });
  }
};

export const getPalette = async (req: Request, res: Response): Promise<void> => {
  const paletteId = parseInt(req.params.paletteId, 10);

  if (isNaN(paletteId)) {
    res.status(400).json({ error: "Invalid palette ID" });
    return;
  }

  try {
    const palette = await prisma.palette.findUnique({
      where: { id: paletteId },
      include: {
        photo: true,
        colors: true,
        user: { select: { id: true, name: true, username: true, profilePhoto: true } },
      },
    });

    if (!palette) {
      res.status(404).json({ error: "Palette not found" });
      return;
    }

    res.status(200).json({ palette });
  } catch (error) {
    console.error("Error fetching palette:", error);
    res.status(500).json({ error: "Error fetching palette", details: error });
  }
};

export const updatePalette = async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).userId;
  const paletteId = parseInt(req.params.paletteId, 10);
  const { title, isPublic } = req.body;
  if (!userId || isNaN(paletteId)) {
    res.status(400).json({ error: "Invalid user ID or palette ID" });
    return;
  }
  try {
    const palette = await prisma.palette.findUnique({ where: { id: paletteId } });
    if (!palette) {
      res.status(404).json({ error: "Palette not found" });
      return;
    }
    if (palette.userId !== userId) {
      res.status(403).json({ error: "Not authorized to update this palette" });
      return;
    }
    const updatedPalette = await prisma.palette.update({
      where: { id: paletteId },
      data: {
        title: title !== undefined ? title : palette.title,
        isPublic: isPublic !== undefined
          ? (isPublic === "true" || isPublic === true)
          : palette.isPublic,
      },
    });
    res.status(200).json({
      message: "Palette updated successfully",
      palette: updatedPalette,
    });
  } catch (error) {
    console.error("Error updating palette:", error);
    res.status(500).json({ error: "Error updating palette", details: error });
  }
};

export const deletePalette = async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).userId;
  const paletteId = parseInt(req.params.paletteId, 10);
  if (!userId || isNaN(paletteId)) {
    res.status(400).json({ error: "Invalid user ID or palette ID" });
    return;
  }
  try {
    const palette = await prisma.palette.findUnique({ where: { id: paletteId } });
    if (!palette) {
      res.status(404).json({ error: "Palette not found" });
      return;
    }
    if (palette.userId !== userId) {
      res.status(403).json({ error: "Not authorized to delete this palette" });
      return;
    }
    const photoId = palette.photoId;
    await prisma.color.deleteMany({ where: { paletteId } });
    await prisma.palette.delete({ where: { id: paletteId } });
    const remainingPalettes = await prisma.palette.count({ where: { photoId } });
    const remainingColors = await prisma.color.count({ where: { photoId } });
    if (remainingPalettes === 0 && remainingColors === 0) {
      await prisma.photo.delete({ where: { id: photoId } });
    }
    res.status(200).json({ message: "Palette deleted successfully" });
  } catch (error) {
    console.error("Error deleting palette:", error);
    res.status(500).json({ error: "Error deleting palette", details: error });
  }
};

export const getPublicPalettes = async (req: Request, res: Response): Promise<void> => {
  try {
    const palettes = await prisma.palette.findMany({
      where: { isPublic: true },
      include: {
        photo: true,
        colors: true,
        user: { select: { id: true, name: true, username: true, profilePhoto: true } },
      },
    });

    res.status(200).json({ palettes });
  } catch (error) {
    console.error("Error fetching public palettes:", error);
    res.status(500).json({ error: "Error fetching public palettes", details: error });
  }
};

export const getUserPublicPalettes = async (req: Request, res: Response): Promise<void> => {
  const userId = parseInt(req.params.userId, 10);

  if (isNaN(userId)) {
    res.status(400).json({ error: "User ID is required and must be a number" });
    return;
  }

  try {
    const palettes = await prisma.palette.findMany({
      where: { userId, isPublic: true },
      include: {
        photo: true,
        colors: true,
        user: { select: { id: true, name: true, username: true, profilePhoto: true } },
      },
    });

    res.status(200).json({ palettes });
  } catch (error) {
    console.error("Error fetching public palettes:", error);
    res.status(500).json({ error: "Error fetching public palettes", details: error });
  }
};

export const getExplorePalettes = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page, limit } = req.query;
    const pageNumber = page ? parseInt(page as string, 10) : 1;
    const pageSize = limit ? parseInt(limit as string, 10) : 10;
    const offset = (pageNumber - 1) * pageSize;

    const palettes = await prisma.palette.findMany({
      where: { isPublic: true },
      include: {
        photo: true,
        colors: true,
        user: { select: { id: true, name: true, username: true, profilePhoto: true } },
      },
      orderBy: { createdAt: "desc" },
      take: pageSize,
      skip: offset,
    });

    res.status(200).json({ palettes });
  } catch (error) {
    console.error("Error fetching explore palettes:", error);
    res.status(500).json({ error: "Error fetching explore palettes", details: error });
  }
};

export const getPaletteDetails = async (req: Request, res: Response): Promise<void> => {
  const paletteId = parseInt(req.params.paletteId, 10);

  if (isNaN(paletteId)) {
    res.status(400).json({ error: "ID da paleta inválido" });
    return;
  }

  try {
    const palette = await prisma.palette.findUnique({
      where: { id: paletteId },
      include: {
        photo: { select: { id: true, imageUrl: true } },
        colors: true,
        user: { select: { id: true, name: true, username: true, profilePhoto: true } },
      },
    });

    if (!palette) {
      res.status(404).json({ error: "Paleta não encontrada" });
      return;
    }

    res.status(200).json({ palette });
  } catch (error) {
    console.error("❌ Erro ao buscar detalhes da paleta:", error);
    res.status(500).json({ error: "Erro ao buscar detalhes da paleta", details: error });
  }
};

export const getUserStats = async (req: Request, res: Response): Promise<void> => {
  const userId = parseInt(req.params.userId, 10);

  if (isNaN(userId)) {
    res.status(400).json({ error: "User ID is required and must be a number" });
    return;
  }

  try {
    const followersCount = await prisma.follower.count({ where: { followingId: userId } });
    const followingCount = await prisma.follower.count({ where: { followerId: userId } });

    res.status(200).json({
      followers: followersCount,
      following: followingCount,
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    res.status(500).json({ error: "Error fetching user stats", details: error });
  }
};

export const getFollowersWithStatus = async (req: Request, res: Response): Promise<void> => {
  const userId = parseInt(req.params.userId, 10);

  if (isNaN(userId)) {
    res.status(400).json({ error: "User ID is required and must be a number" });
    return;
  }

  try {
    const followers = await prisma.follower.findMany({
      where: { followingId: userId },
      include: { follower: { select: { id: true, name: true, username: true, profilePhoto: true } } },
    });

    const followersWithStatus = await Promise.all(
      followers.map(async follower => {
        const isFollowingBack = await prisma.follower.findFirst({
          where: { followerId: userId, followingId: follower.follower.id },
        });

        return { ...follower.follower, isFollowingBack: !!isFollowingBack };
      })
    );

    res.status(200).json(followersWithStatus);
  } catch (error) {
    console.error("Error fetching followers with status:", error);
    res.status(500).json({ error: "Error fetching followers with status" });
  }
};

export const getFollowingWithStatus = async (req: Request, res: Response): Promise<void> => {
  const userId = parseInt(req.params.userId, 10);

  if (isNaN(userId)) {
    res.status(400).json({ error: "User ID is required and must be a number" });
    return;
  }

  try {
    const following = await prisma.follower.findMany({
      where: { followerId: userId },
      include: { following: { select: { id: true, name: true, username: true, profilePhoto: true } } },
    });

    const followingWithStatus = await Promise.all(
      following.map(async followedUser => {
        const followsBack = await prisma.follower.findFirst({
          where: { followerId: followedUser.following.id, followingId: userId },
        });

        return { ...followedUser.following, followsBack: !!followsBack };
      })
    );

    res.status(200).json(followingWithStatus);
  } catch (error) {
    console.error("Error fetching following with status:", error);
    res.status(500).json({ error: "Error fetching following with status" });
  }
};

