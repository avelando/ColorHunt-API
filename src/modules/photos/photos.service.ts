import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { extractPaletteFromImage } from '../../utils/image.utils';
import { UploadPhotoDto } from '../palettes/dto/upload.dto';

@Injectable()
export class PhotosService {
  constructor(private readonly prisma: PrismaService) {}

  async uploadPhoto(userId: string, uploadPhotoDto: UploadPhotoDto) {
    const { imageUrl, title, isPublic } = uploadPhotoDto;

    if (!userId) {
      throw new HttpException('User ID is missing or invalid', HttpStatus.BAD_REQUEST);
    }
    if (!imageUrl) {
      throw new HttpException('No image URL provided', HttpStatus.BAD_REQUEST);
    }
    try {
      const photo = await this.prisma.photo.create({
        data: {
          userId,
          imageUrl,
        },
      });
      console.log("📷 Foto salva no banco com ID:", photo.id);

      const extractedColors = await extractPaletteFromImage(imageUrl);
      if (!extractedColors || extractedColors.length !== 5) {
        throw new HttpException(
          'Failed to extract a valid 5-color palette',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      console.log("🎨 Paleta extraída:", extractedColors);

      const palette = await this.prisma.palette.create({
        data: {
          userId,
          photoId: photo.id,
          title: title || "Minha Paleta",
          isPublic: typeof isPublic === 'string' ? isPublic === 'true' : !!isPublic,
        },
      });

      const colorData = extractedColors.map((hex: string) => ({
        hex,
        paletteId: palette.id,
        photoId: photo.id,
      }));
      await this.prisma.color.createMany({ data: colorData });

      const createdPalette = await this.prisma.palette.findUnique({
        where: { id: palette.id },
        include: { photo: true, colors: true },
      });

      return {
        message: "Photo uploaded and palette generated successfully",
        photo,
        palette: createdPalette,
      };
    } catch (error) {
      console.error("❌ Erro ao processar upload:", error);
      throw new HttpException({ error: "Error processing upload", details: error.message }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getUserPhotos(userId: string) {
    if (!userId) {
      throw new HttpException('User ID is missing or invalid', HttpStatus.BAD_REQUEST);
    }
    try {
      const photos = await this.prisma.photo.findMany({
        where: { userId },
        include: { palette: { include: { colors: true } } },
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
