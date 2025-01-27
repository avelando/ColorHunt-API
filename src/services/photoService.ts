import prisma from "../config/prismaClient";

export const savePhoto = async (userId: number, imageUrl: string) => {
  return await prisma.photo.create({
    data: { imageUrl, userId },
  });
};

export const getPhotoById = async (photoId: number, userId: number) => {
  return await prisma.photo.findFirst({
    where: { id: photoId, userId },
    include: { colors: true },
  });
};
