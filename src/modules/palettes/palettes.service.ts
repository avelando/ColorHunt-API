import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { CreatePaletteDto } from './dto/create.dto';
import { UpdatePaletteDto } from './dto/update.dto';
import { extractPaletteFromImage } from '../../utils/image.utils';

@Injectable()
export class PalettesService {
  constructor(private readonly prisma: PrismaService) { }

  private parseIsPublic(isPublic: boolean | string | undefined): boolean {
    if (typeof isPublic === 'string') {
      return isPublic.toLowerCase() === 'true';
    }
    return !!isPublic;
  }

  async createPalette(userId: string, createDto: CreatePaletteDto) {
    const { photoId, title, isPublic } = createDto;
    if (!userId) {
      throw new HttpException('User ID missing', HttpStatus.BAD_REQUEST);
    }
    if (!photoId) {
      throw new HttpException('Photo ID is required', HttpStatus.BAD_REQUEST);
    }
    try {
      const photo = await this.prisma.photo.findUnique({ where: { id: photoId } });
      if (!photo) {
        throw new HttpException('Photo not found', HttpStatus.NOT_FOUND);
      }

      const extractedColors = await extractPaletteFromImage(photo.imageUrl);
      if (!extractedColors || extractedColors.length !== 5) {
        throw new HttpException(
          'Failed to extract a valid 5-color palette',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const palette = await this.prisma.palette.create({
        data: {
          userId,
          photoId: photo.id,
          title: title || 'Minha Paleta',
          isPublic: this.parseIsPublic(isPublic),
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
        include: {
          photo: true,
          colors: true,
          user: { select: { id: true, name: true, username: true, profilePhoto: true } },
        },
      });

      return {
        message: 'Palette created successfully',
        palette: createdPalette,
      };
    } catch (error) {
      console.error('Error creating palette:', error);
      throw new HttpException(
        { error: 'Error processing palette creation', details: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getUserPalettes(userId: string) {
    if (!userId) {
      throw new HttpException('User ID missing', HttpStatus.BAD_REQUEST);
    }
    try {
      const palettes = await this.prisma.palette.findMany({
        where: { userId },
        include: {
          photo: true,
          colors: true,
          user: { select: { id: true, name: true, username: true, profilePhoto: true } },
        },
      });
      return { palettes };
    } catch (error) {
      console.error('Error fetching palettes:', error);
      throw new HttpException(
        { error: 'Error fetching palettes', details: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getPalette(paletteId: string) {
    try {
      const palette = await this.prisma.palette.findUnique({
        where: { id: paletteId },
        include: {
          photo: true,
          colors: true,
          user: { select: { id: true, name: true, username: true, profilePhoto: true } },
        },
      });
      if (!palette) {
        throw new HttpException('Palette not found', HttpStatus.NOT_FOUND);
      }
      return { palette };
    } catch (error) {
      console.error('Error fetching palette:', error);
      throw new HttpException(
        { error: 'Error fetching palette', details: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updatePalette(userId: string, paletteId: string, updateDto: UpdatePaletteDto) {
    const { title, isPublic } = updateDto;
    try {
      const palette = await this.prisma.palette.findUnique({ where: { id: paletteId } });
      if (!palette) {
        throw new HttpException('Palette not found', HttpStatus.NOT_FOUND);
      }
      if (palette.userId !== userId) {
        throw new HttpException('Not authorized to update this palette', HttpStatus.FORBIDDEN);
      }

      const updatedPalette = await this.prisma.palette.update({
        where: { id: paletteId },
        data: {
          title: title !== undefined ? title : palette.title,
          isPublic: isPublic !== undefined ? this.parseIsPublic(isPublic) : palette.isPublic,
        },
      });

      return {
        message: 'Palette updated successfully',
        palette: updatedPalette,
      };
    } catch (error) {
      console.error('Error updating palette:', error);
      throw new HttpException(
        { error: 'Error updating palette', details: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deletePalette(userId: string, paletteId: string) {
    try {
      const palette = await this.prisma.palette.findUnique({ where: { id: paletteId } });
      if (!palette) {
        throw new HttpException('Palette not found', HttpStatus.NOT_FOUND);
      }
      if (palette.userId !== userId) {
        throw new HttpException('Not authorized to delete this palette', HttpStatus.FORBIDDEN);
      }

      const photoId = palette.photoId;
      await this.prisma.color.deleteMany({ where: { paletteId } });
      await this.prisma.palette.delete({ where: { id: paletteId } });

      const remainingPalettes = await this.prisma.palette.count({ where: { photoId } });
      const remainingColors = await this.prisma.color.count({ where: { photoId } });
      if (remainingPalettes === 0 && remainingColors === 0) {
        await this.prisma.photo.delete({ where: { id: photoId } });
      }

      return { message: 'Palette deleted successfully' };
    } catch (error) {
      console.error('Error deleting palette:', error);
      throw new HttpException(
        { error: 'Error deleting palette', details: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getPublicPalettes() {
    try {
      const palettes = await this.prisma.palette.findMany({
        where: { isPublic: true },
        include: {
          photo: true,
          colors: true,
          user: { select: { id: true, name: true, username: true, profilePhoto: true } },
        },
      });
      return { palettes };
    } catch (error) {
      console.error('Error fetching public palettes:', error);
      throw new HttpException(
        { error: 'Error fetching public palettes', details: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getUserPublicPalettes(userId: string) {
    try {
      const palettes = await this.prisma.palette.findMany({
        where: { userId, isPublic: true },
        include: {
          photo: true,
          colors: true,
          user: { select: { id: true, name: true, username: true, profilePhoto: true } },
        },
      });
      return { palettes };
    } catch (error) {
      console.error('Error fetching public palettes:', error);
      throw new HttpException(
        { error: 'Error fetching public palettes', details: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getExplorePalettes(page: number, limit: number) {
    const pageNumber = page || 1;
    const pageSize = limit || 10;
    const offset = (pageNumber - 1) * pageSize;

    try {
      const palettes = await this.prisma.palette.findMany({
        where: { isPublic: true },
        include: {
          photo: true,
          colors: true,
          user: { select: { id: true, name: true, username: true, profilePhoto: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: pageSize,
        skip: offset,
      });
      return { palettes };
    } catch (error) {
      console.error('Error fetching explore palettes:', error);
      throw new HttpException(
        { error: 'Error fetching explore palettes', details: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getPaletteDetails(paletteId: string) {
    try {
      const palette = await this.prisma.palette.findUnique({
        where: { id: paletteId },
        include: {
          photo: { select: { id: true, imageUrl: true } },
          colors: true,
          user: { select: { id: true, name: true, username: true, profilePhoto: true } },
        },
      });
      if (!palette) {
        throw new HttpException('Palette not found', HttpStatus.NOT_FOUND);
      }
      return { palette };
    } catch (error) {
      console.error('❌ Erro ao buscar detalhes da paleta:', error);
      throw new HttpException(
        { error: 'Error fetching palette details', details: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async duplicatePalette(originalPaletteId: string) {
    const original = await this.prisma.palette.findUnique({
      where: { id: originalPaletteId },
      include: { photo: true, colors: true },
    });

    if (!original) {
      throw new HttpException('Original palette not found', HttpStatus.NOT_FOUND);
    }

    const newPhoto = await this.prisma.photo.create({
      data: {
        userId: original.photo.userId,
        imageUrl: original.photo.imageUrl,
      },
    });

    const newPalette = await this.prisma.palette.create({
      data: {
        userId: original.userId,
        photoId: newPhoto.id,
        title: `${original.title} (duplicated)`,
        isPublic: false,
        originalId: original.id,
      },
    });

    const colorData = original.colors.map((c) => ({
      hex: c.hex,
      paletteId: newPalette.id,
      photoId: newPhoto.id,
    }));
    await this.prisma.color.createMany({ data: colorData });

    return this.prisma.palette.findUnique({
      where: { id: newPalette.id },
      include: {
        photo: true,
        colors: true,
        original: true,
      },
    });
  }
}
