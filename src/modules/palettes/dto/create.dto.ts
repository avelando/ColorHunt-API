import { ApiProperty } from '@nestjs/swagger';

export class CreatePaletteDto {
  @ApiProperty({ description: 'ID da foto utilizada para criar a paleta' })
  photoId: string;

  @ApiProperty({ description: 'Título da paleta', required: false, default: 'Minha Paleta' })
  title?: string;

  @ApiProperty({
    description: 'Define se a paleta é pública. Pode ser boolean ou string "true"/"false".',
    required: false,
    default: false,
  })
  isPublic?: boolean | string;
}
