import { Controller, Post, Get, Delete, UploadedFile, UseInterceptors, Req, Param, HttpException, HttpStatus } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PhotosService } from './photos.service';
import { Request, Express } from 'express';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Fotos')
@Controller('photos')
export class PhotosController {
  constructor(private readonly photosService: PhotosService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Enviar foto' })
  @ApiResponse({ status: 201, description: 'Foto enviada com sucesso' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadPhoto(@Req() req: Request, @UploadedFile() file: Express.Multer.File) {
    const userId = req.headers['x-user-id'] as string;
    
    if (!userId) {
      throw new HttpException('User ID missing in headers', HttpStatus.BAD_REQUEST);
    }

    return await this.photosService.uploadPhoto(userId, file);
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
