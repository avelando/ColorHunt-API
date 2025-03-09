"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getExplorePalettes = exports.getPalette = exports.generatePalette = exports.uploadPhoto = void 0;
const photoService_1 = require("../services/photoService");
const colorService_1 = require("../services/colorService");
const imageUtils_1 = require("../utils/imageUtils");
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
const prismaClient_1 = __importDefault(require("../config/prismaClient"));
const uploadPhoto = async (req, res) => {
    const userId = req.userId;
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
        cloudinary_1.default.uploader.upload_stream({ folder: "colorhunt", resource_type: "image" }, async (error, result) => {
            if (error || !result) {
                res.status(500).json({ error: "Cloudinary upload failed" });
                return;
            }
            const photo = await prismaClient_1.default.photo.create({
                data: {
                    userId,
                    imageUrl: result.secure_url,
                },
            });
            await prismaClient_1.default.color.create({
                data: {
                    photoId: photo.id,
                    title: title || "Minha Paleta",
                    isPublic: isPublic === "true",
                    hex: "#000000",
                },
            });
            res.status(201).json({ message: "Photo uploaded successfully", photo });
        }).end(req.file.buffer);
    }
    catch (error) {
        res.status(500).json({ error: "Error saving photo", details: error });
    }
};
exports.uploadPhoto = uploadPhoto;
const generatePalette = async (req, res) => {
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
        const photo = await (0, photoService_1.getPhotoById)(photoId, userId);
        if (!photo) {
            res.status(403).json({ message: "Unauthorized or photo not found" });
            return;
        }
        const palette = await (0, imageUtils_1.extractPaletteFromImage)(photo.imageUrl);
        await (0, colorService_1.saveColors)(photo.id, palette);
        res.status(201).json({ message: "Palette generated successfully", palette });
    }
    catch (error) {
        res.status(500).json({ error: "Error generating palette", details: error });
    }
};
exports.generatePalette = generatePalette;
const getPalette = async (req, res) => {
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
        const photo = await (0, photoService_1.getPhotoById)(photoId, userId);
        if (!photo) {
            res.status(403).json({ message: "Unauthorized or photo not found" });
            return;
        }
        const palette = (0, colorService_1.extractPaletteFromColors)(photo.colors);
        res.status(200).json({ palette });
    }
    catch (error) {
        res.status(500).json({ error: "Error fetching palette", details: error });
    }
};
exports.getPalette = getPalette;
const getExplorePalettes = async (req, res) => {
    const userId = req.userId;
    if (!userId) {
        res.status(400).json({ error: "User ID is missing or invalid" });
        return;
    }
    try {
        const following = await prismaClient_1.default.follower.findMany({
            where: { followerId: userId },
            select: { followingId: true },
        });
        const followingIds = following.map((f) => f.followingId);
        const palettes = await prismaClient_1.default.color.findMany({
            where: {
                OR: [
                    { isPublic: true },
                    { photo: { userId: { in: followingIds } } },
                ],
            },
            include: {
                photo: {
                    select: { imageUrl: true, userId: true, user: { select: { name: true } } },
                },
            },
        });
        res.status(200).json({ palettes });
    }
    catch (error) {
        res.status(500).json({ error: "Error fetching palettes", details: error });
    }
};
exports.getExplorePalettes = getExplorePalettes;
