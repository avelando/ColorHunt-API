import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import prisma from "../config/prismaClient";

export const getUser = async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).userId;
  try {
    if (!userId) {
      res.status(400).json({ message: "User ID is missing" });
      return;
    }
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        id: true, 
        name: true, 
        username: true, 
        email: true,
        profilePhoto: true,
      },
    });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Error fetching user" });
  }
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).userId;
  const { name, username, email, password } = req.body;
  try {
    if (!userId) {
      res.status(400).json({ message: "User ID is missing" });
      return;
    }
    const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        username,
        email,
        ...(hashedPassword && { password: hashedPassword }),
      },
      select: { id: true, name: true, username: true, email: true, profilePhoto: true },
    });
    res.json({ message: "User updated successfully", updatedUser });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Error updating user" });
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).userId;
  try {
    if (!userId) {
      res.status(400).json({ message: "User ID is missing" });
      return;
    }
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    await prisma.user.delete({ where: { id: userId } });
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Error deleting user" });
  }
};

export const followUser = async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).userId;
  const { followId } = req.body;

  if (!userId || !followId) {
    res.status(400).json({ error: "Missing userId or followId" });
    return;
  }

  try {
    if (userId === followId) {
      res.status(400).json({ error: "Você não pode seguir a si mesmo." });
      return;
    }

    const existingFollow = await prisma.follower.findFirst({
      where: { followerId: userId, followingId: followId },
    });

    if (existingFollow) {
      res.status(400).json({ error: "Você já segue este usuário." });
      return;
    }

    await prisma.follower.create({
      data: { followerId: userId, followingId: followId },
    });

    res.json({ message: "Agora você está seguindo este usuário!" });
  } catch (error) {
    console.error("Erro ao seguir usuário:", error);
    res.status(500).json({ error: "Erro ao seguir usuário." });
  }
};

export const unfollowUser = async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).userId;
  const { followId } = req.body;
  if (!userId || !followId) {
    res.status(400).json({ error: "Missing userId or followId" });
    return;
  }
  try {
    await prisma.follower.deleteMany({
      where: { followerId: userId, followingId: followId },
    });
    res.json({ message: "Unfollowed user!" });
  } catch (error) {
    console.error("Error unfollowing user:", error);
    res.status(500).json({ error: "Error unfollowing user" });
  }
};

export const getFollowers = async (req: Request, res: Response): Promise<void> => {
  const userId = parseInt(req.params.userId, 10);
  if (isNaN(userId)) {
    res.status(400).json({ error: "User ID is required and must be a number" });
    return;
  }
  try {
    const followers = await prisma.follower.findMany({
      where: { followingId: userId },
      include: { 
        follower: { 
          select: { 
            id: true, 
            name: true, 
            username: true, 
            profilePhoto: true 
          } 
        } 
      },
    });
    res.json(followers.map((f) => f.follower));
  } catch (error) {
    console.error("Error fetching followers:", error);
    res.status(500).json({ error: "Error fetching followers" });
  }
};

export const getFollowing = async (req: Request, res: Response): Promise<void> => {
  const userId = parseInt(req.params.userId, 10);
  if (isNaN(userId)) {
    res.status(400).json({ error: "User ID is required and must be a number" });
    return;
  }
  try {
    const following = await prisma.follower.findMany({
      where: { followerId: userId },
      include: { 
        following: { 
          select: { 
            id: true, 
            name: true, 
            username: true,
            profilePhoto: true 
          } 
        } 
      },
    });
    res.json(following.map((f) => f.following));
  } catch (error) {
    console.error("Error fetching following users:", error);
    res.status(500).json({ error: "Error fetching following users" });
  }
};

export const getUserStats = async (req: Request, res: Response): Promise<void> => {
  const userId = parseInt(req.params.userId, 10);
  if (isNaN(userId)) {
    res.status(400).json({ error: "User ID is required and must be a number" });
    return;
  }
  try {
    const palettesCount = await prisma.palette.count({
      where: { userId },
    });
    const followersCount = await prisma.follower.count({
      where: { followingId: userId },
    });
    const followingCount = await prisma.follower.count({
      where: { followerId: userId },
    });
    res.status(200).json({
      palettes: palettesCount,
      followers: followersCount,
      following: followingCount,
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    res.status(500).json({ error: "Error fetching user stats", details: error });
  }
};

export const updateProfilePhoto = async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).userId;
  const { profilePhotoUrl } = req.body;

  if (!userId) {
    res.status(400).json({ error: "User ID is missing or invalid" });
    return;
  }
  if (!profilePhotoUrl) {
    res.status(400).json({ error: "Profile photo URL is required" });
    return;
  }
  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { profilePhoto: profilePhotoUrl },
      select: { id: true, name: true, username: true, email: true, profilePhoto: true },
    });
    res.status(200).json({
      message: "Profile photo updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating profile photo:", error);
    res.status(500).json({ error: "Error updating profile photo", details: error });
  }
};

export const searchUsersByUsername = async (req: Request, res: Response): Promise<void> => {
  const { q } = req.query;
  if (!q || typeof q !== "string") {
    res.status(400).json({ error: "Search query (q) is missing or invalid" });
    return;
  }
  try {
    const users = await prisma.user.findMany({
      where: {
        username: {
          contains: q,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        name: true,
        username: true,
        profilePhoto: true,
      },
    });
    if (users.length === 0) {
      res.status(200).json({ message: "Nenhum usuário encontrado." });
      return;
    }
    res.status(200).json({ users });
  } catch (error) {
    console.error("Error searching users by username:", error);
    res.status(500).json({ error: "Error searching users by username", details: error });
  }
};

export const getUserProfile = async (req: Request, res: Response): Promise<void> => {
  const userId = parseInt(req.params.userId, 10);
  const loggedUserId = (req as any).userId;

  if (isNaN(userId)) {
    res.status(400).json({ error: "User ID é necessário e deve ser um número válido" });
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        id: true, 
        name: true, 
        username: true, 
        profilePhoto: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: "Usuário não encontrado" });
      return;
    }

    const isFollowing = await prisma.follower.findFirst({
      where: { followerId: loggedUserId, followingId: userId },
    });

    const followersCount = await prisma.follower.count({
      where: { followingId: userId },
    });

    const followingCount = await prisma.follower.count({
      where: { followerId: userId },
    });

    const publicPalettes = await prisma.palette.findMany({
      where: { userId, isPublic: true },
      select: {
        id: true,
        title: true,
        colors: true,
        photo: {
          select: {
            imageUrl: true,
          },
        },
      },
    });

    const formattedPalettes = publicPalettes.map(palette => ({
      ...palette,
      imageUrl: palette.photo?.imageUrl || null,
    }));

    const totalPalettesCount = await prisma.palette.count({
      where: { userId },
    });

    res.status(200).json({
      user: {
        ...user,
        followersCount,
        followingCount,
        totalPalettesCount,
        palettes: formattedPalettes,
        isFollowing: !!isFollowing,
      },
    });
  } catch (error) {
    console.error("Erro ao buscar perfil do usuário:", error);
    res.status(500).json({ error: "Erro ao buscar perfil do usuário", details: error });
  }
};
