import prisma from "../config/prismaClient";

export const getPhotoById = async (photoId: number, userId: number) => {
  console.log("📷 Buscando foto no banco para photoId:", photoId, "userId:", userId);

  const photo = await prisma.photo.findFirst({
    where: { id: photoId, userId },
    include: { palette: { include: { colors: true } } },
  });

  if (!photo) {
    console.log("❌ Foto não encontrada!");
  } else if (!photo.palette) {
    console.log("✅ Foto encontrada, mas sem paleta associada:", photo.imageUrl);
  } else {
    console.log("✅ Foto encontrada com paleta:", photo.imageUrl, "Paleta ID:", photo.palette.id);
  }

  return photo;
};
