import prisma from "../config/prismaClient";

export const getPhotoById = async (photoId: number, userId: number) => {
  console.log("📷 Buscando foto no banco para photoId:", photoId, "userId:", userId);

  const photo = await prisma.photo.findFirst({
    where: { id: photoId, userId },
    include: { colors: true },
  });

  if (!photo) {
    console.log("❌ Foto não encontrada!");
  } else {
    console.log("✅ Foto encontrada:", photo.imageUrl);
  }

  return photo;
};
