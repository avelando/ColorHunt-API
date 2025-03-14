import { Controller, Post, Delete, Param, Req } from '@nestjs/common';
import { LikesService } from './likes.service';
import { Request } from 'express';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Curtidas')
@Controller('likes')
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @Post(':paletteId')
  @ApiOperation({ summary: 'Curtir uma paleta' })
  @ApiResponse({ status: 201, description: 'Paleta curtida com sucesso.' })
  async likePalette(@Req() req: Request, @Param('paletteId') paletteId: string) {
    const userId = (req as any).userId as string;
    return await this.likesService.likePalette(userId, paletteId);
  }

  @Delete(':paletteId')
  @ApiOperation({ summary: 'Remover curtida de uma paleta' })
  @ApiResponse({ status: 200, description: 'Curtida removida com sucesso.' })
  async unlikePalette(@Req() req: Request, @Param('paletteId') paletteId: string) {
    const userId = (req as any).userId as string;
    return await this.likesService.unlikePalette(userId, paletteId);
  }
}
