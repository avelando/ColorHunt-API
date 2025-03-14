import { Controller, Post, Get, Delete, Body, Param, Req } from '@nestjs/common';
import { PhotosService } from './photos.service';
import { Request } from 'express';
import { UploadPhotoDto } from '../palettes/dto/upload.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Fotos')
@Controller('photos')
export class PhotosController {
  constructor(private readonly photosService: PhotosService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Enviar foto' })
  @ApiResponse({ status: 201, description: 'Foto enviada com sucesso' })
  async uploadPhoto(@Req() req: Request, @Body() uploadPhotoDto: UploadPhotoDto) {
    const userId = (req as any).userId as string;
    return await this.photosService.uploadPhoto(userId, uploadPhotoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obter fotos do usuário' })
  @ApiResponse({ status: 200, description: 'Fotos retornadas com sucesso' })
  async getUserPhotos(@Req() req: Request) {
    const userId = (req as any).userId as string;
    return await this.photosService.getUserPhotos(userId);
  }

  @Delete(':photoId')
  @ApiOperation({ summary: 'Excluir foto' })
  @ApiResponse({ status: 200, description: 'Foto excluída com sucesso' })
  async deletePhoto(@Req() req: Request, @Param('photoId') photoId: string) {
    const userId = (req as any).userId as string;
    return await this.photosService.deletePhoto(userId, parseInt(photoId, 10));
  }
}
