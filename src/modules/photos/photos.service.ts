import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { v2 as cloudinary } from 'cloudinary';
import { UploadApiResponse } from 'cloudinary';

@Injectable()
export class PhotosService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('CLOUDINARY') private readonly cloudinary
  ) {}

  async uploadPhoto(userId: string, file: Express.Multer.File) {
    if (!userId) {
      throw new HttpException('User ID is missing or invalid', HttpStatus.BAD_REQUEST);
    }
    if (!file) {
      throw new HttpException('No file provided', HttpStatus.BAD_REQUEST);
    }

    try {
      const uploadResult: UploadApiResponse = await this.cloudinary.uploader.upload(file.path, {
        folder: 'photos',
        use_filename: true,
        unique_filename: false,
      });

      const photo = await this.prisma.photo.create({
        data: { userId, imageUrl: uploadResult.secure_url },
      });

      console.log("📷 Foto salva no banco com ID:", photo.id);
      return { photo };
    } catch (error) {
      console.error("❌ Erro ao processar upload de foto:", error);
      throw new HttpException({ error: "Error processing photo upload", details: error.message }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getUserPhotos(userId: string) {
    if (!userId) {
      throw new HttpException('User ID is missing or invalid', HttpStatus.BAD_REQUEST);
    }
    try {
      const photos = await this.prisma.photo.findMany({
        where: { userId },
      });
      return { photos };
    } catch (error) {
      console.error("❌ Erro ao buscar fotos:", error);
      throw new HttpException({ error: "Error fetching photos", details: error.message }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async deletePhoto(userId: string, photoId: number) {
    if (!userId || isNaN(photoId)) {
      throw new HttpException('Invalid user ID or photo ID', HttpStatus.BAD_REQUEST);
    }
    try {
      const photo = await this.prisma.photo.findUnique({ where: { id: photoId.toString() } });
      if (!photo) {
        throw new HttpException('Photo not found', HttpStatus.NOT_FOUND);
      }
      if (photo.userId !== userId) {
        throw new HttpException('Not authorized to delete this photo', HttpStatus.FORBIDDEN);
      }
      await this.prisma.photo.delete({ where: { id: photoId.toString() } });
      return { message: "Photo deleted successfully" };
    } catch (error) {
      console.error("Error deleting photo:", error);
      throw new HttpException({ error: "Error deleting photo", details: error.message }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
