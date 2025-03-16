import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class PhotosService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('CLOUDINARY') private readonly cloudinaryInstance
  ) {}

  async uploadPhoto(userId: string, file: Express.Multer.File) {
    if (!userId) {
      throw new HttpException('User ID is missing or invalid', HttpStatus.BAD_REQUEST);
    }
    if (!file) {
      throw new HttpException('No file provided', HttpStatus.BAD_REQUEST);
    }

    try {
      console.log("📤 Iniciando upload para Cloudinary...");
      console.log("📁 Arquivo recebido:", file);

      return new Promise((resolve, reject) => {
        const stream = this.cloudinaryInstance.uploader.upload_stream(
          {
            folder: 'colorhunt',
            use_filename: true,
            unique_filename: false,
            upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET,
          },
          async (error: any, uploadResult: UploadApiResponse) => {
            if (error) {
              console.error("❌ Erro no upload para Cloudinary:", error);
              reject(new HttpException("Erro ao fazer upload da imagem", HttpStatus.INTERNAL_SERVER_ERROR));
            }

            console.log("✅ Upload concluído:", uploadResult.secure_url);

            const photo = await this.prisma.photo.create({
              data: { userId, imageUrl: uploadResult.secure_url },
            });

            console.log("📷 Foto salva no banco com ID:", photo.id);
            resolve({ photo });
          }
        );

        const bufferStream = new Readable();
        bufferStream.push(file.buffer);
        bufferStream.push(null);

        bufferStream.pipe(stream);
      });
    } catch (error) {
      console.error("❌ Erro ao processar upload de foto:", error);
      throw new HttpException(
        { error: "Error processing photo upload", details: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
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
