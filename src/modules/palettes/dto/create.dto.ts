import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBooleanString,
} from 'class-validator';

export class CreatePaletteDto {
  @ApiProperty({ description: 'ID da foto (se já existir)', required: false })
  @IsString()
  @IsOptional()
  photoId?: string;

  @ApiProperty({ description: 'Título da paleta', required: false, default: 'Minha Paleta' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({
    description: 'Define se a paleta é pública. Pode ser "true"/"false".',
    required: false,
    default: false,
  })
  @IsBooleanString()
  @IsOptional()
  isPublic?: boolean | string;
}
