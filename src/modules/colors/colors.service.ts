import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';

@Injectable()
export class ColorsService {
  constructor(private readonly prisma: PrismaService) {}

  async updateColor(userId: string, colorId: string, hex: string) {
    if (!hex) {
      throw new HttpException('O novo valor hex é obrigatório.', HttpStatus.BAD_REQUEST);
    }
  
    const color = await this.prisma.color.findUnique({
      where: { id: colorId },
      include: { palette: true },
    });
  
    if (!color) {
      throw new HttpException('Cor não encontrada.', HttpStatus.NOT_FOUND);
    }
  
    if (color.palette.userId !== userId) {
      throw new HttpException('Não autorizado a atualizar essa cor.', HttpStatus.FORBIDDEN);
    }
  
    return await this.prisma.color.update({
      where: { id: colorId },
      data: { hex },
    });
  }
}
