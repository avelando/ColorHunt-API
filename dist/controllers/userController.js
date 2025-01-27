"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUser = exports.getUser = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prismaClient_1 = __importDefault(require("../config/prismaClient"));
const register = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const user = await prismaClient_1.default.user.create({
            data: { name, email, password: hashedPassword },
        });
        res.status(201).json(user);
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
        if (!user || !(await bcryptjs_1.default.compare(password, user.password))) {
            res.status(401).json({ message: "Invalid credentials" });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id }, process.env.JWT_SECRET, {
            expiresIn: "1h",
        });
        res.json({ token });
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
        res.json(updatedUser);
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
