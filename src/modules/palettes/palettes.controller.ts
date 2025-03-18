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
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CustomRequest } from '../../common/custom-request.interface';

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

  @Get('user')
  @ApiOperation({ summary: 'Obter paletas do usuário logado' })
  async getUserPalettes(@Req() req: CustomRequest) {
    if (!req.user || !req.user.id) {
      throw new HttpException('User not authenticated', HttpStatus.UNAUTHORIZED);
    }
    return this.palettesService.getUserPalettes(req.user.id);
  }

  @Get(':paletteId')
  @ApiOperation({ summary: 'Obter paleta pelo ID' })
  async getPalette(@Param('paletteId') paletteId: string) {
    return this.palettesService.getPalette(paletteId);
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

  @Delete(':paletteId')
  @ApiOperation({ summary: 'Excluir paleta' })
  async deletePalette(@Req() req: CustomRequest, @Param('paletteId') paletteId: string) {
    if (!req.user || !req.user.id) {
      throw new HttpException('User not authenticated', HttpStatus.UNAUTHORIZED);
    }
    return this.palettesService.deletePalette(paletteId);
  }

  @Get('public/all')
  @ApiOperation({ summary: 'Obter todas as paletas públicas' })
  async getPublicPalettes() {
    return this.palettesService.getAllPublicPalettes();
  }  

  @Get('public/user')
  @ApiOperation({ summary: 'Obter paletas públicas do usuário logado' })
  async getUserPublicPalettes(@Req() req: CustomRequest) {
    if (!req.user || !req.user.id) {
      throw new HttpException('User not authenticated', HttpStatus.UNAUTHORIZED);
    }
    return this.palettesService.getUserPublicPalettes(req.user.id);
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
  async duplicatePalette(@Req() req: CustomRequest, @Param('paletteId') paletteId: string) {
    if (!req.user || !req.user.id) {
      throw new HttpException('User not authenticated', HttpStatus.UNAUTHORIZED);
    }
    return this.palettesService.duplicatePalette(paletteId);
  }
}
