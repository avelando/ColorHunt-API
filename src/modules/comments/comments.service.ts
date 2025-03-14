import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';

@Injectable()
export class CommentsService {
  constructor(private readonly prisma: PrismaService) {}

  async addComment(userId: string, paletteId: string, content: string) {
    if (!content || content.trim() === '') {
      throw new HttpException('O conteúdo do comentário é obrigatório.', HttpStatus.BAD_REQUEST);
    }

    const comment = await this.prisma.comment.create({
      data: {
        paletteId,
        userId,
        content,
      },
    });

    return { message: 'Comentário adicionado com sucesso.', comment };
  }

  async getComments(paletteId: string) {
    const comments = await this.prisma.comment.findMany({
      where: { paletteId },
      orderBy: { createdAt: 'asc' },
      include: {
        user: { select: { id: true, name: true, username: true, profilePhoto: true } },
      },
    });

    return { comments };
  }

  async updateComment(userId: string, commentId: string, content: string) {
    if (!content || content.trim() === '') {
      throw new HttpException('O novo conteúdo do comentário é obrigatório.', HttpStatus.BAD_REQUEST);
    }

    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new HttpException('Comentário não encontrado.', HttpStatus.NOT_FOUND);
    }

    if (comment.userId !== userId) {
      throw new HttpException('Não autorizado a editar este comentário.', HttpStatus.FORBIDDEN);
    }

    const updatedComment = await this.prisma.comment.update({
      where: { id: commentId },
      data: { content },
    });

    return { message: 'Comentário atualizado com sucesso.', comment: updatedComment };
  }

  async removeComment(userId: string, commentId: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new HttpException('Comentário não encontrado.', HttpStatus.NOT_FOUND);
    }

    if (comment.userId !== userId) {
      throw new HttpException('Não autorizado a remover este comentário.', HttpStatus.FORBIDDEN);
    }

    await this.prisma.comment.delete({
      where: { id: commentId },
    });

    return { message: 'Comentário removido com sucesso.' };
  }
}
