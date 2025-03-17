import { Module } from '@nestjs/common';
import { PalettesController } from './palettes.controller';
import { PalettesService } from './palettes.service';
import { CloudinaryModule } from 'src/config/cloudinary.module';

@Module({
  imports: [CloudinaryModule],
  controllers: [PalettesController],
  providers: [PalettesService]
})
export class PalettesModule {}
