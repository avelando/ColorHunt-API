import { ApiProperty } from '@nestjs/swagger';

export class UpdatePaletteDto {
  @ApiProperty({ description: 'Novo título da paleta', required: false })
  title?: string;

  @ApiProperty({
    description: 'Define se a paleta é pública. Pode ser boolean ou string "true"/"false".',
    required: false,
  })
  isPublic?: boolean | string;
}
