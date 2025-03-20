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
  UseInterceptors,
  UploadedFile,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { PalettesService } from './palettes.service';
import { UpdatePaletteDto } from './dto/update.dto';
import { CreatePaletteDto } from './dto/create.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CustomRequest } from '../../common/custom-request.interface';
import { Request } from 'express';

@ApiTags('Paletas')
@Controller('palettes')
@UseGuards(JwtAuthGuard)
export class PalettesController {
  constructor(private readonly palettesService: PalettesService) {}

  @Post('create-with-image')
  @ApiOperation({ summary: 'Criar paleta + Upload de Imagem' })
  @UseInterceptors(FileInterceptor('file'))
  async createPaletteWithImage(
    @Req() req: CustomRequest,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreatePaletteDto,
  ) {
    if (!req.user || !req.user.id) {
      throw new HttpException('User not authenticated', HttpStatus.UNAUTHORIZED);
    }
    return this.palettesService.createPaletteWithImage(file, dto);
  }

  @Get('public/user')
  @ApiOperation({ summary: 'Obter paletas públicas do usuário logado' })
  async getUserPublicPalettes(@Req() req: CustomRequest) {
    if (!req.user || !req.user.id) {
      throw new HttpException('User not authenticated', HttpStatus.UNAUTHORIZED);
    }
    return this.palettesService.getUserPublicPalettes(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('explore')
  @ApiOperation({ summary: 'Lista todas as paletas públicas (exceto as do usuário logado)' })
  @ApiResponse({ status: 200, description: 'Lista de paletas públicas retornada com sucesso' })
  async getExplorePalettes(@Req() req: CustomRequest) {
    if (!req.user || !req.user.id) {
      throw new HttpException('Usuário não autenticado', HttpStatus.UNAUTHORIZED);
    }
  
    return await this.palettesService.getExplorePalettes(req.user.id);
  }

  @Get('user')
  @ApiOperation({ summary: 'Obter paletas do usuário logado' })
  async getUserPalettes(@Req() req: CustomRequest) {
    if (!req.user || !req.user.id) {
      throw new HttpException('User not authenticated', HttpStatus.UNAUTHORIZED);
    }
    return this.palettesService.getUserPalettes(req.user.id);
  }

  @Get('details/:paletteId')
  @ApiOperation({ summary: 'Obter detalhes da paleta' })
  async getPaletteDetails(@Param('paletteId') paletteId: string) {
    return this.palettesService.getPaletteDetails(paletteId);
  }

  @Get(':paletteId')
  @ApiOperation({ summary: 'Obter paleta pelo ID' })
  async getPalette(@Param('paletteId') paletteId: string) {
    return this.palettesService.getPalette(paletteId);
  }

  @Delete(':paletteId')
  @ApiOperation({ summary: 'Excluir paleta' })
  async deletePalette(@Req() req: CustomRequest, @Param('paletteId') paletteId: string) {
    if (!req.user || !req.user.id) {
      throw new HttpException('User not authenticated', HttpStatus.UNAUTHORIZED);
    }
    return this.palettesService.deletePalette(paletteId);
  }

  @Patch(':paletteId')
  @ApiOperation({ summary: 'Atualizar paleta' })
  async updatePalette(
    @Req() req: CustomRequest,
    @Param('paletteId') paletteId: string,
    @Body() dto: UpdatePaletteDto,
  ) {
    if (!req.user || !req.user.id) {
      throw new HttpException('User not authenticated', HttpStatus.UNAUTHORIZED);
    }
    return this.palettesService.updatePalette(paletteId, dto);
  }
  
  @Post(':paletteId/duplicate')
  @ApiOperation({ summary: 'Duplicar uma paleta' })
  async duplicatePalette(
    @Req() req: CustomRequest, 
    @Param('paletteId') paletteId: string
  ) {
    if (!req.user || !req.user.id) {
      throw new HttpException('User not authenticated', HttpStatus.UNAUTHORIZED);
    }
  
    return this.palettesService.duplicatePalette(req.user.id, paletteId);
  }  
}
