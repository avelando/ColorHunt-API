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
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { PalettesService } from './palettes.service';
import { Request } from 'express';
import { UpdatePaletteDto } from './dto/update.dto';
import { CreatePaletteDto } from './dto/create.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Paletas')
@Controller('palettes')
export class PalettesController {
  constructor(private readonly palettesService: PalettesService) { }

  @Post()
  @ApiOperation({ summary: 'Criar paleta' })
  async createPalette(@Req() req: Request, @Body() dto: CreatePaletteDto) {
    const userId = (req as any).userId as string;
    return this.palettesService.createPalette(userId, dto);
  }

  @Get('user')
  @ApiOperation({ summary: 'Obter paletas do usuário logado' })
  async getUserPalettes(@Req() req: Request) {
    const userId = (req as any).user?.id;
    if (!userId) {
      throw new HttpException('User ID missing', HttpStatus.BAD_REQUEST);
    }
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
