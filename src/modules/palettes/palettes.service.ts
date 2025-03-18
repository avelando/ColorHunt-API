import { Injectable, HttpException, HttpStatus, Inject, Scope } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { CreatePaletteDto } from './dto/create.dto';
import { UpdatePaletteDto } from './dto/update.dto';
import { extractPaletteFromImage } from '../../utils/image.utils';
import { UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';
import { REQUEST } from '@nestjs/core';
import { CustomRequest } from '../../common/custom-request.interface'; 

@Injectable({ scope: Scope.REQUEST })
export class PalettesService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('CLOUDINARY') private readonly cloudinaryInstance: any,
    @Inject(REQUEST) private readonly request: CustomRequest,
  ) { }

  private get userId(): string {
    if (!this.request.user || !this.request.user.id) {
      throw new HttpException('User not authenticated', HttpStatus.UNAUTHORIZED);
    }
    return this.request.user.id;
  }

  private parseIsPublic(isPublic: boolean | string | undefined): boolean {
    if (typeof isPublic === 'string') {
      return isPublic.toLowerCase() === 'true';
    }
    return !!isPublic;
  }

  async createPaletteWithImage(file: Express.Multer.File, createDto: CreatePaletteDto) {
    if (!file) throw new HttpException('No file provided', HttpStatus.BAD_REQUEST);

    const userId = this.userId;
    const uploadResult: UploadApiResponse = await new Promise((resolve, reject) => {
      const stream = this.cloudinaryInstance.uploader.upload_stream(
        {
          folder: 'colorhunt',
          upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET,
        },
        (error: any, result: UploadApiResponse) => {
          if (error) return reject(new HttpException('Image upload failed', HttpStatus.INTERNAL_SERVER_ERROR));
          resolve(result);
        },
      );
      const bufferStream = new Readable();
      bufferStream.push(file.buffer);
      bufferStream.push(null);
      bufferStream.pipe(stream);
    });

    const photo = await this.prisma.photo.create({
      data: { userId, imageUrl: uploadResult.secure_url },
    });

    let extractedColors: string[];
    try {
      extractedColors = await extractPaletteFromImage(photo.imageUrl);
    } catch {
      await this.prisma.photo.delete({ where: { id: photo.id } });
      throw new HttpException('Failed to extract colors', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    const createdPalette = await this.prisma.$transaction(async (tx) => {
      const palette = await tx.palette.create({
        data: { userId, photoId: photo.id, title: createDto.title || 'Minha Paleta', isPublic: this.parseIsPublic(createDto.isPublic) },
      });

      await tx.color.createMany({ data: extractedColors.map((hex) => ({ hex, paletteId: palette.id, photoId: photo.id })) });

      return tx.palette.findUnique({ where: { id: palette.id }, include: { photo: true, colors: true, user: true } });
    });

    return { message: 'Palette created successfully', palette: createdPalette };
  }

  async getUserPalettes(id: string) {
    return await this.prisma.palette.findMany({
      where: { userId: this.userId },
      include: { photo: true, colors: true, user: true },
    });
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

  async updatePalette(paletteId: string, dto: UpdatePaletteDto) {
    const userId = this.userId;
    const palette = await this.prisma.palette.findUnique({ where: { id: paletteId } });
    if (!palette) throw new HttpException('Palette not found', HttpStatus.NOT_FOUND);
    if (palette.userId !== userId) throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);

    return await this.prisma.palette.update({
      where: { id: paletteId },
      data: {
        title: dto.title ?? palette.title,
        isPublic: dto.isPublic !== undefined ? this.parseIsPublic(dto.isPublic) : palette.isPublic,
      },
    });
  }

  async deletePalette(paletteId: string): Promise<{ message: string }> {
    const userId = this.userId; 
  
    const palette = await this.prisma.palette.findUnique({ where: { id: paletteId } });
    if (!palette) throw new HttpException('Palette not found', HttpStatus.NOT_FOUND);
    
    if (palette.userId !== userId) throw new HttpException('Not authorized to delete this palette', HttpStatus.FORBIDDEN);
  
    await this.prisma.color.deleteMany({ where: { paletteId } });
    await this.prisma.palette.delete({ where: { id: paletteId } });
  
    const remainingPalettes = await this.prisma.palette.count({ where: { photoId: palette.photoId } });
    if (remainingPalettes === 0) {
      await this.prisma.photo.delete({ where: { id: palette.photoId } });
    }
  
    return { message: 'Palette deleted successfully' };
  }  

  async getUserPublicPalettes(userId: string) {
    return await this.prisma.palette.findMany({
      where: { userId, isPublic: true },
      include: { photo: true, colors: true, user: true },
    });
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

  async duplicatePalette(originalId: string) {
    const userId = this.userId;
    const original = await this.prisma.palette.findUnique({
      where: { id: originalId },
      include: { photo: true, colors: true },
    });
    if (!original) throw new HttpException('Original palette not found', HttpStatus.NOT_FOUND);
    if (original.userId !== userId) throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);

    const newPhoto = await this.prisma.photo.create({
      data: { userId, imageUrl: original.photo.imageUrl },
    });
    const newPalette = await this.prisma.palette.create({
      data: { userId, photoId: newPhoto.id, title: `${original.title} (copy)`, isPublic: false, originalId },
    });
    const colors = original.colors.map(c => ({ hex: c.hex, paletteId: newPalette.id, photoId: newPhoto.id }));
    await this.prisma.color.createMany({ data: colors });

    return this.prisma.palette.findUnique({ where: { id: newPalette.id }, include: { photo: true, colors: true } });
  }

  async getAllPublicPalettes() {
    return await this.prisma.palette.findMany({
      where: { isPublic: true },
      include: { photo: true, colors: true, user: true },
    });
  }  
}
