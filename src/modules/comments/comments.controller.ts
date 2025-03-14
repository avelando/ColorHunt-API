import { Controller, Post, Get, Patch, Delete, Body, Param, Req } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { Request } from 'express';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Comentários')
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post(':paletteId')
  @ApiOperation({ summary: 'Adicionar comentário a uma paleta' })
  @ApiResponse({ status: 201, description: 'Comentário adicionado com sucesso' })
  async addComment(
    @Req() req: Request,
    @Param('paletteId') paletteId: string,
    @Body('content') content: string,
  ) {
    const userId = (req as any).userId as string;
    return await this.commentsService.addComment(userId, paletteId, content);
  }

  @Get(':paletteId')
  @ApiOperation({ summary: 'Obter comentários de uma paleta' })
  @ApiResponse({ status: 200, description: 'Comentários retornados com sucesso' })
  async getComments(@Param('paletteId') paletteId: string) {
    return await this.commentsService.getComments(paletteId);
  }

  @Patch(':commentId')
  @ApiOperation({ summary: 'Atualizar comentário' })
  @ApiResponse({ status: 200, description: 'Comentário atualizado com sucesso' })
  async updateComment(
    @Req() req: Request,
    @Param('commentId') commentId: string,
    @Body('content') content: string,
  ) {
    const userId = (req as any).userId as string;
    return await this.commentsService.updateComment(userId, commentId, content);
  }

  @Delete(':commentId')
  @ApiOperation({ summary: 'Remover comentário' })
  @ApiResponse({ status: 200, description: 'Comentário removido com sucesso' })
  async removeComment(
    @Req() req: Request,
    @Param('commentId') commentId: string,
  ) {
    const userId = (req as any).userId as string;
    return await this.commentsService.removeComment(userId, commentId);
  }
}
