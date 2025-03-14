import { ApiProperty } from '@nestjs/swagger';

export class SearchUserDto {
  @ApiProperty({ description: 'Termo de busca (username parcial ou completo)' })
  q: string;
}
