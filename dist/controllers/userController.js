"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFollowing = exports.getFollowers = exports.unfollowUser = exports.followUser = exports.deleteUser = exports.updateUser = exports.getUser = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prismaClient_1 = __importDefault(require("../config/prismaClient"));
const register = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const existingUser = await prismaClient_1.default.user.findUnique({ where: { email } });
        if (existingUser) {
            res.status(400).json({ error: "Email already in use" });
            return;
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const user = await prismaClient_1.default.user.create({
            data: { name, email, password: hashedPassword },
            select: { id: true, name: true, email: true },
        });
        res.status(201).json({ message: "User registered successfully", user });
    }
    catch (error) {
        res.status(500).json({ error: "Error creating user" });
    }
};
exports.register = register;
const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await prismaClient_1.default.user.findUnique({ where: { email } });
        if (!user) {
            res.status(401).json({ message: "Invalid credentials" });
            return;
        }
        const isPasswordValid = await bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            res.status(401).json({ message: "Invalid credentials" });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id }, process.env.JWT_SECRET, {
            expiresIn: "1h",
        });
        res.json({ message: "Login successful", token });
    }
    catch (error) {
        res.status(500).json({ error: "Error logging in" });
    }
};
exports.login = login;
const getUser = async (req, res) => {
    const userId = req.userId;
    try {
        if (!userId) {
            res.status(400).json({ message: "User ID is missing" });
            return;
        }
        const user = await prismaClient_1.default.user.findUnique({
            where: { id: userId },
            select: { id: true, name: true, email: true },
        });
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ error: "Error fetching user" });
    }
};
exports.getUser = getUser;
const updateUser = async (req, res) => {
    const userId = req.userId;
    const { name, email, password } = req.body;
    try {
        if (!userId) {
            res.status(400).json({ message: "User ID is missing" });
            return;
        }
        const hashedPassword = password ? await bcryptjs_1.default.hash(password, 10) : undefined;
        const updatedUser = await prismaClient_1.default.user.update({
            where: { id: userId },
            data: {
                name,
                email,
                password: hashedPassword,
            },
            select: { id: true, name: true, email: true },
        });
        res.json({ message: "User updated successfully", updatedUser });
    }
    catch (error) {
        res.status(500).json({ error: "Error updating user" });
    }
};
exports.updateUser = updateUser;
const deleteUser = async (req, res) => {
    const userId = req.userId;
    try {
        if (!userId) {
            res.status(400).json({ message: "User ID is missing" });
            return;
        }
        const user = await prismaClient_1.default.user.findUnique({ where: { id: userId } });
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        await prismaClient_1.default.user.delete({ where: { id: userId } });
        res.status(200).json({ message: "User deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ error: "Error deleting user" });
    }
};
exports.deleteUser = deleteUser;
const followUser = async (req, res) => {
    const userId = req.userId;
    const { followId } = req.body;
    if (!userId || !followId) {
        res.status(400).json({ error: "Missing userId or followId" });
        return;
    }
    try {
        await prismaClient_1.default.follower.create({
            data: {
                followerId: userId,
                followingId: followId,
            },
        });
        res.json({ message: "Now following user!" });
    }
    catch (error) {
        res.status(500).json({ error: "Error following user" });
    }
};
exports.followUser = followUser;
const unfollowUser = async (req, res) => {
    const userId = req.userId;
    const { followId } = req.body;
    if (!userId || !followId) {
        res.status(400).json({ error: "Missing userId or followId" });
        return;
    }
    try {
        await prismaClient_1.default.follower.deleteMany({
            where: { followerId: userId, followingId: followId },
        });
        res.json({ message: "Unfollowed user!" });
    }
    catch (error) {
        res.status(500).json({ error: "Error unfollowing user" });
    }
};
exports.unfollowUser = unfollowUser;
const getFollowers = async (req, res) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
        res.status(400).json({ error: "User ID is required and must be a number" });
        return;
    }
    try {
        const followers = await prismaClient_1.default.follower.findMany({
            where: { followingId: userId },
            include: { follower: { select: { id: true, name: true } } },
        });
        res.json(followers.map((f) => f.follower));
    }
    catch (error) {
        res.status(500).json({ error: "Error fetching followers" });
    }
};
exports.getFollowers = getFollowers;
const getFollowing = async (req, res) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
        res.status(400).json({ error: "User ID is required and must be a number" });
        return;
    }
    try {
        const following = await prismaClient_1.default.follower.findMany({
            where: { followerId: userId },
            include: { following: { select: { id: true, name: true } } },
        });
        res.json(following.map((f) => f.following));
    }
    catch (error) {
        res.status(500).json({ error: "Error fetching following users" });
    }
};
exports.getFollowing = getFollowing;
