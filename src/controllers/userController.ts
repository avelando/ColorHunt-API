import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
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
      select: { id: true, name: true, username: true, email: true },
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
      select: { id: true, name: true, username: true, email: true },
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
    await prisma.follower.create({
      data: { followerId: userId, followingId: followId },
    });
    res.json({ message: "Now following user!" });
  } catch (error) {
    console.error("Error following user:", error);
    res.status(500).json({ error: "Error following user" });
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
      include: { follower: { select: { id: true, name: true, username: true } } },
    });
    res.json(
      followers.map((f: { follower: { id: number; name: string; username: string } }) => f.follower)
    );
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
      include: { following: { select: { id: true, name: true, username: true } } },
    });
    res.json(
      following.map((f: { following: { id: number; name: string; username: string } }) => f.following)
    );
  } catch (error) {
    console.error("Error fetching following users:", error);
    res.status(500).json({ error: "Error fetching following users" });
  }
};
