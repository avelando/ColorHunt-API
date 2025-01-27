"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractPaletteFromImage = void 0;
const get_image_colors_1 = __importDefault(require("get-image-colors"));
const extractPaletteFromImage = async (imageUrl) => {
    const colors = await (0, get_image_colors_1.default)(imageUrl);
    return colors.map((color) => color.hex());
};
exports.extractPaletteFromImage = extractPaletteFromImage;
