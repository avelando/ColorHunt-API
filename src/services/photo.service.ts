// src/services/photo.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma/prisma.service';

@Injectable()
export class PhotoService {
  constructor(private readonly prisma: PrismaService) {}

  async getPhotoById(photoId: number, userId: number) {
    console.log("📷 Buscando foto no banco para photoId:", photoId, "userId:", userId);

    const photo = await this.prisma.photo.findFirst({
      where: { 
        id: photoId.toString(),
        userId: userId.toString()
      },
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
  }
}
