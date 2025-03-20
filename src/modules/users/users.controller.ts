import {
  Controller,
  Get,
  Patch,
  Delete,
  Post,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { Request } from 'express';
import { UpdateUserDto } from './dto/update.dto';
import { FollowUserDto } from './dto/follow.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Delete('me')
  @ApiOperation({ summary: 'Deleta o usuário logado' })
  @ApiResponse({ status: 200, description: 'Usuário deletado com sucesso' })
  async deleteUser(@Req() req: Request) {
    const userId = (req.user as any).id;
    return await this.usersService.deleteUser(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiOperation({ summary: 'Retorna os dados do usuário logado' })
  @ApiResponse({ status: 200, description: 'Usuário encontrado com sucesso' })
  async getUser(@Req() req: Request) {
    const userId = (req.user as any).id;
    return await this.usersService.getUser(userId);
  }

  @Get(':userId/followers')
  @ApiOperation({ summary: 'Retorna os seguidores do usuário especificado' })
  @ApiResponse({ status: 200, description: 'Seguidores encontrados com sucesso' })
  @ApiParam({
    name: 'userId',
    description: 'ID do usuário para o qual se deseja obter os seguidores',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  async getFollowers(@Param('userId') userId: string) {
    return await this.usersService.getFollowers(userId);
  }

  @Get(':userId/following')
  @ApiOperation({ summary: 'Retorna os usuários seguidos pelo usuário especificado' })
  @ApiResponse({ status: 200, description: 'Usuários seguidos encontrados com sucesso' })
  @ApiParam({
    name: 'userId',
    description: 'ID do usuário para o qual se deseja obter os usuários que ele segue',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  async getFollowing(@Param('userId') userId: string) {
    return await this.usersService.getFollowing(userId);
  }

  @Get(':userId/stats')
  @ApiOperation({ summary: 'Retorna estatísticas do usuário (paletas, seguidores, seguindo)' })
  @ApiResponse({ status: 200, description: 'Estatísticas retornadas com sucesso' })
  @ApiParam({
    name: 'userId',
    description: 'ID do usuário para o qual se deseja obter as estatísticas',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  async getUserStats(@Param('userId') userId: string) {
    return await this.usersService.getUserStats(userId);
  }

  @Get('search')
  @ApiOperation({ summary: 'Busca usuários pelo username' })
  @ApiResponse({ status: 200, description: 'Usuários encontrados com sucesso' })
  @ApiQuery({
    name: 'q',
    description: 'Termo de busca (username parcial ou completo)',
    example: 'john',
  })
  async searchUsers(@Query('q') query: string) {
    return await this.usersService.searchUsersByUsername(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':userId/profile')
  @ApiOperation({ summary: 'Retorna o perfil do usuário especificado' })
  @ApiResponse({ status: 200, description: 'Perfil retornado com sucesso' })
  @ApiParam({
    name: 'userId',
    description: 'ID do usuário para o qual se deseja obter o perfil',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  async getUserProfile(@Param('userId') userId: string, @Req() req: Request) {
    const loggedUserId = (req.user as any).id;
    return await this.usersService.getUserProfile(userId, loggedUserId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  @ApiOperation({ summary: 'Atualiza as informações do usuário logado' })
  @ApiBody({
    description: 'Dados para atualizar o usuário',
    type: UpdateUserDto,
    required: true,
    schema: {
      example: {
        name: 'John Doe',
        username: 'johnny',
        email: 'john@example.com',
        password: 'newPassword',
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Usuário atualizado com sucesso' })
  async updateUser(@Req() req: Request, @Body() body: UpdateUserDto) {
    const userId = (req.user as any).id;
    return await this.usersService.updateUser(userId, body);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me/profile-photo')
  @UseInterceptors(FileInterceptor('file'))
  async updateProfilePhoto(@Req() req: Request, @UploadedFile() file: Express.Multer.File) {
    const userId = req.user?.id;
    if (!userId) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    return this.usersService.uploadProfilePhoto(userId, file);
  }

  @UseGuards(JwtAuthGuard)
  @Post('follow')
  @ApiOperation({ summary: 'Segue um usuário' })
  @ApiBody({
    description: 'ID do usuário que se deseja seguir',
    type: FollowUserDto,
    required: true,
    schema: {
      example: {
        followId: '123e4567-e89b-12d3-a456-426614174000',
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Agora você está seguindo este usuário!' })
  async followUser(@Req() req: Request, @Body() body: FollowUserDto) {
    const userId = (req.user as any).id;
    return await this.usersService.followUser(userId, body.followId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':userId/followers-status')
  @ApiOperation({ summary: 'Retorna os seguidores do usuário especificado e verifica se o usuário autenticado os segue' })
  @ApiResponse({ status: 200, description: 'Lista de seguidores retornada com sucesso' })
  @ApiParam({
    name: 'userId',
    description: 'ID do usuário para o qual se deseja obter os seguidores',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  async getFollowersWithStatus(@Param('userId') userId: string, @Req() req: Request) {
    const loggedUserId = (req.user as any).id;
    return await this.usersService.getFollowersWithStatus(userId, loggedUserId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('unfollow')
  @ApiOperation({ summary: 'Deixa de seguir um usuário' })
  @ApiBody({
    description: 'ID do usuário que se deseja deixar de seguir',
    type: FollowUserDto,
    required: true,
    schema: {
      example: {
        followId: '123e4567-e89b-12d3-a456-426614174000',
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Você deixou de seguir este usuário' })
  async unfollowUser(@Req() req: Request, @Body() body: FollowUserDto) {
    const userId = (req.user as any).id;
    return await this.usersService.unfollowUser(userId, body.followId);
  }
}
