import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
} from '@nestjs/common';
import { PalettesService } from './palettes.service';
import { Request } from 'express';
import { UploadPhotoDto } from './dto/upload.dto';
import { UpdatePaletteDto } from './dto/update.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Paletas')
@Controller('palettes')
export class PalettesController {
  constructor(private readonly palettesService: PalettesService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Enviar foto e gerar paleta' })
  @ApiResponse({ status: 201, description: 'Foto enviada e paleta gerada com sucesso' })
  async uploadPhoto(@Req() req: Request, @Body() dto: UploadPhotoDto) {
    const userId = (req as any).userId as string;
    return this.palettesService.uploadPhoto(userId, dto);
  }

  @Post()
  @ApiOperation({ summary: 'Criar paleta' })
  async createPalette(@Req() req: Request, @Body() dto: UploadPhotoDto) {
    const userId = (req as any).userId as string;
    return this.palettesService.createPalette(userId, dto);
  }

  @Get('user')
  @ApiOperation({ summary: 'Obter paletas do usuário logado' })
  async getUserPalettes(@Req() req: Request) {
    const userId = (req as any).userId as string;
    return this.palettesService.getUserPalettes(userId);
  }

  @Get(':paletteId')
  @ApiOperation({ summary: 'Obter paleta pelo ID' })
  async getPalette(@Param('paletteId') paletteId: string) {
    return this.palettesService.getPalette(paletteId);
  }

  @Patch(':paletteId')
  @ApiOperation({ summary: 'Atualizar paleta' })
  async updatePalette(
    @Req() req: Request,
    @Param('paletteId') paletteId: string,
    @Body() dto: UpdatePaletteDto,
  ) {
    const userId = (req as any).userId as string;
    return this.palettesService.updatePalette(userId, paletteId, dto);
  }

  @Delete(':paletteId')
  @ApiOperation({ summary: 'Excluir paleta' })
  async deletePalette(@Req() req: Request, @Param('paletteId') paletteId: string) {
    const userId = (req as any).userId as string;
    return this.palettesService.deletePalette(userId, paletteId);
  }

  @Get('public/all')
  @ApiOperation({ summary: 'Obter todas as paletas públicas' })
  async getPublicPalettes() {
    return this.palettesService.getPublicPalettes();
  }

  @Get('public/user')
  @ApiOperation({ summary: 'Obter paletas públicas do usuário logado' })
  async getUserPublicPalettes(@Req() req: Request) {
    const userId = (req as any).userId as string;
    return this.palettesService.getUserPublicPalettes(userId);
  }

  @Get('explore/all')
  @ApiOperation({ summary: 'Explorar paletas públicas com paginação' })
  async getExplorePalettes(@Query('page') page: string, @Query('limit') limit: string) {
    const pageNumber = parseInt(page, 10) || 1;
    const pageSize = parseInt(limit, 10) || 10;
    return this.palettesService.getExplorePalettes(pageNumber, pageSize);
  }

  @Get('details/:paletteId')
  @ApiOperation({ summary: 'Obter detalhes da paleta' })
  async getPaletteDetails(@Param('paletteId') paletteId: string) {
    return this.palettesService.getPaletteDetails(paletteId);
  }

  @Post(':paletteId/duplicate')
  @ApiOperation({ summary: 'Duplicar uma paleta' })
  async duplicatePalette(@Param('paletteId') paletteId: string) {
    return this.palettesService.duplicatePalette(paletteId);
  }
}
