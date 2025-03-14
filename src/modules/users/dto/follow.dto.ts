import { ApiProperty } from '@nestjs/swagger';

export class FollowUserDto {
  @ApiProperty({ description: 'ID do usuário que deseja seguir / deixar de seguir' })
  followId: string;
}
