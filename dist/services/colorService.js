"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractPaletteFromColors = exports.saveColors = void 0;
const prismaClient_1 = __importDefault(require("../config/prismaClient"));
const saveColors = async (photoId, colors) => {
    const colorData = colors.map((hex) => ({ hex, photoId }));
    return await prismaClient_1.default.color.createMany({ data: colorData });
};
exports.saveColors = saveColors;
const extractPaletteFromColors = (colors) => {
    return colors.map((color) => color.hex);
};
exports.extractPaletteFromColors = extractPaletteFromColors;
