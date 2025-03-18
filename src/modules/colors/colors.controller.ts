import { Controller, Patch, Body, Param, Req, UseGuards } from '@nestjs/common';
import { ColorsService } from './colors.service';
import { Request } from 'express';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Cores')
@Controller('colors')
@UseGuards(JwtAuthGuard)
export class ColorsController {
  constructor(private readonly colorsService: ColorsService) {}

  @Patch(':colorId')
  @ApiOperation({ summary: 'Atualizar cor' })
  @ApiResponse({ status: 200, description: 'Cor atualizada com sucesso.' })
  async updateColor(
    @Req() req: Request,
    @Param('colorId') colorId: string,
    @Body('hex') hex: string,
  ) {
    const userId = (req as any).user.id;
    return await this.colorsService.updateColor(userId, colorId, hex);
  }
}
