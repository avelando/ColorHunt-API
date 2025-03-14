import { ApiProperty } from '@nestjs/swagger';

export class UploadPhotoDto {
  @ApiProperty({ description: 'URL da imagem enviada (Cloudinary)' })
  imageUrl: string;

  @ApiProperty({ description: 'Título da paleta', required: false, default: 'Minha Paleta' })
  title?: string;

  @ApiProperty({
    description: 'Define se a paleta é pública. Pode ser boolean ou string "true"/"false".',
    required: false,
    default: false,
  })
  isPublic?: boolean | string;
}
