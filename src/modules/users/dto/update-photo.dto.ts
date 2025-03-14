import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUrl } from 'class-validator';

export class UpdateProfilePhotoDto {
  @ApiProperty({ description: 'URL da nova foto de perfil', example: 'https://example.com/profile.jpg' })
  @IsString()
  @IsUrl()
  profilePhotoUrl: string;
}
