"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPalette = exports.generatePalette = exports.uploadPhoto = void 0;
const photoService_1 = require("../services/photoService");
const colorService_1 = require("../services/colorService");
const imageUtils_1 = require("../utils/imageUtils");
const uploadPhoto = async (req, res) => {
    const userId = req.userId;
    if (!userId) {
        res.status(400).json({ error: "User ID is missing or invalid" });
        return;
    }
    const { imageUrl } = req.body;
    if (!imageUrl) {
        res.status(400).json({ error: "Image URL is required" });
        return;
    }
    try {
        const photo = await (0, photoService_1.savePhoto)(userId, imageUrl);
        res.status(201).json({ message: "Photo saved successfully", photo });
    }
    catch (error) {
        res.status(500).json({ error: "Error saving photo" });
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
        res.status(500).json({ error: "Error generating palette" });
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
        res.status(500).json({ error: "Error fetching palette" });
    }
};
exports.getPalette = getPalette;
