import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './database/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { PalettesModule } from './modules/palettes/palettes.module';
import { ColorsModule } from './modules/colors/colors.module';
import { PhotosModule } from './modules/photos/photos.module';
import { LikesModule } from './modules/likes/likes.module';
import { CommentsModule } from './modules/comments/comments.module';
import { CloudinaryProvider } from './services/cloudinary.provider';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    PalettesModule,
    ColorsModule,
    PhotosModule,
    LikesModule,
    CommentsModule,
  ],
  controllers: [AppController],
  providers: [AppService, CloudinaryProvider],
})
export class AppModule {}
