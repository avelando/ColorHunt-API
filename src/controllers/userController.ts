import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../config/prismaClient";

export const register = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password } = req.body;
  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ error: "Email already in use" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
      select: { id: true, name: true, email: true },
    });

    res.status(201).json({ message: "User registered successfully", user });
  } catch (error) {
    res.status(500).json({ error: "Error creating user" });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET as string, {
      expiresIn: "1h",
    });

    res.json({ message: "Login successful", token });
  } catch (error) {
    res.status(500).json({ error: "Error logging in" });
  }
};

export const getUser = async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).userId;

  try {
    if (!userId) {
      res.status(400).json({ message: "User ID is missing" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true },
    });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Error fetching user" });
  }
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).userId;
  const { name, email, password } = req.body;

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
        email,
        password: hashedPassword,
      },
      select: { id: true, name: true, email: true },
    });

    res.json({ message: "User updated successfully", updatedUser });
  } catch (error) {
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
      data: {
        followerId: userId,
        followingId: followId,
      },
    });

    res.json({ message: "Now following user!" });
  } catch (error) {
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
    res.status(500).json({ error: "Error unfollowing user" });
  }
};

export const getFollowers = async (req: Request, res: Response): Promise<void> => {
  const userId = parseInt(req.params.userId);

  if (isNaN(userId)) {
    res.status(400).json({ error: "User ID is required and must be a number" });
    return;
  }

  try {
    const followers = await prisma.follower.findMany({
      where: { followingId: userId },
      include: { follower: { select: { id: true, name: true } } },
    });

    res.json(followers.map((f: { follower: { id: number; name: string } }) => f.follower));
  } catch (error) {
    res.status(500).json({ error: "Error fetching followers" });
  }
};

export const getFollowing = async (req: Request, res: Response): Promise<void> => {
  const userId = parseInt(req.params.userId);

  if (isNaN(userId)) {
    res.status(400).json({ error: "User ID is required and must be a number" });
    return;
  }

  try {
    const following = await prisma.follower.findMany({
      where: { followerId: userId },
      include: { following: { select: { id: true, name: true } } },
    });

    res.json(following.map((f: { following: { id: number; name: string } }) => f.following));
  } catch (error) {
    res.status(500).json({ error: "Error fetching following users" });
  }
};
