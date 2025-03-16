import { Module } from '@nestjs/common';
import { PhotosService } from './photos.service';
import { PhotosController } from './photos.controller';
import { PrismaService } from '../../database/prisma/prisma.service';
import { ConfigModule } from '@nestjs/config';
import { CloudinaryProvider } from '../../config/cloudinary.provider';

@Module({
  imports: [ConfigModule],
  controllers: [PhotosController],
  providers: [PhotosService, PrismaService, CloudinaryProvider],
  exports: [PhotosService],
})
export class PhotosModule {}
