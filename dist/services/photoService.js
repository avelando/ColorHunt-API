"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPhotoById = exports.savePhoto = void 0;
const prismaClient_1 = __importDefault(require("../config/prismaClient"));
const savePhoto = async (userId, imageUrl) => {
    return await prismaClient_1.default.photo.create({
        data: { imageUrl, userId },
    });
};
exports.savePhoto = savePhoto;
const getPhotoById = async (photoId, userId) => {
    return await prismaClient_1.default.photo.findFirst({
        where: { id: photoId, userId },
        include: { colors: true },
    });
};
exports.getPhotoById = getPhotoById;
