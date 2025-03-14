import { Controller, Patch, Body, Param, Req } from '@nestjs/common';
import { ColorsService } from './colors.service';
import { Request } from 'express';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Cores')
@Controller('colors')
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
    const userId = (req as any).userId as string;
    return await this.colorsService.updateColor(userId, colorId, hex);
  }
}
