import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsBooleanString } from 'class-validator';

export class CreatePaletteDto {
  @ApiProperty({ description: 'ID da foto utilizada para criar a paleta' })
  @IsString()
  photoId: string;

  @ApiProperty({ description: 'Título da paleta', required: false, default: 'Minha Paleta' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({
    description: 'Define se a paleta é pública. Pode ser boolean ou string "true"/"false".',
    required: false,
    default: false,
  })
  @IsOptional()
  isPublic?: boolean | string;
}
