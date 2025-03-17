import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBooleanString } from 'class-validator';

export class UpdatePaletteDto {
  @ApiProperty({ description: 'Novo título da paleta', required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({
    description: 'Define se a paleta é pública. Pode ser boolean ou string "true"/"false".',
    required: false,
  })
  @IsOptional()
  @IsBooleanString()
  isPublic?: boolean | string;
}
