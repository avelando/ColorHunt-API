import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';

@Injectable()
export class LikesService {
  constructor(private readonly prisma: PrismaService) {}

  async likePalette(userId: string, paletteId: string) {
    const existingLike = await this.prisma.like.findUnique({
      where: {
        paletteId_userId: { paletteId, userId },
      },
    });

    if (existingLike) {
      throw new HttpException('Você já curtiu essa paleta.', HttpStatus.BAD_REQUEST);
    }

    const like = await this.prisma.like.create({
      data: { paletteId, userId },
    });

    return { message: 'Paleta curtida com sucesso.', like };
  }

  async unlikePalette(userId: string, paletteId: string) {
    const existingLike = await this.prisma.like.findUnique({
      where: {
        paletteId_userId: { paletteId, userId },
      },
    });

    if (!existingLike) {
      throw new HttpException('Você não curtiu essa paleta.', HttpStatus.BAD_REQUEST);
    }

    await this.prisma.like.delete({
      where: { paletteId_userId: { paletteId, userId } },
    });

    return { message: 'Curtida removida com sucesso.' };
  }
}
