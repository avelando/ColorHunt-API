import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNotEmpty } from 'class-validator';

export class FollowUserDto {
  @ApiProperty({ 
    description: 'ID do usuário que deseja seguir / deixar de seguir', 
    example: '123e4567-e89b-12d3-a456-426614174000' 
  })
  @IsUUID()
  @IsNotEmpty()
  followId: string;
}
