import { Injectable, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('CLOUDINARY') private readonly cloudinaryInstance: any
  ) { }

  async getUser(userId: string) {
    if (!userId) {
      throw new HttpException('User ID is missing', HttpStatus.BAD_REQUEST);
    }
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, username: true, email: true, profilePhoto: true },
    });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return user;
  }

  async updateUser(userId: string, data: any) {
    if (!userId) {
      throw new HttpException('User ID is missing', HttpStatus.BAD_REQUEST);
    }
    let hashedPassword;
    if (data.password) {
      hashedPassword = await bcrypt.hash(data.password, 10);
    }
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        username: data.username,
        email: data.email,
        ...(hashedPassword && { password: hashedPassword }),
      },
      select: { id: true, name: true, username: true, email: true, profilePhoto: true },
    });
    return { message: 'User updated successfully', updatedUser };
  }

  async deleteUser(userId: string) {
    if (!userId) {
      throw new HttpException('User ID is missing', HttpStatus.BAD_REQUEST);
    }
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    await this.prisma.user.delete({ where: { id: userId } });
    return { message: 'User deleted successfully' };
  }

  async followUser(userId: string, followId: string) {
    if (!userId || !followId) {
      throw new HttpException('Missing userId or followId', HttpStatus.BAD_REQUEST);
    }
    if (userId === followId) {
      throw new HttpException('Você não pode seguir a si mesmo.', HttpStatus.BAD_REQUEST);
    }
    const existingFollow = await this.prisma.follower.findFirst({
      where: { followerId: userId, followingId: followId },
    });
    if (existingFollow) {
      throw new HttpException('Você já segue este usuário.', HttpStatus.BAD_REQUEST);
    }
    await this.prisma.follower.create({
      data: { followerId: userId, followingId: followId },
    });
    return { message: 'Agora você está seguindo este usuário!' };
  }

  async unfollowUser(userId: string, followId: string) {
    if (!userId || !followId) {
      throw new HttpException('Missing userId or followId', HttpStatus.BAD_REQUEST);
    }
    await this.prisma.follower.deleteMany({
      where: { followerId: userId, followingId: followId },
    });
    return { message: 'Unfollowed user!' };
  }

  async getFollowers(userId: string) {
    if (!userId) {
      throw new HttpException('User ID is required', HttpStatus.BAD_REQUEST);
    }
    const followers = await this.prisma.follower.findMany({
      where: { followingId: userId },
      include: {
        follower: { select: { id: true, name: true, username: true, profilePhoto: true } },
      },
    });
    return followers.map(f => f.follower);
  }

  async getFollowing(userId: string) {
    if (!userId) {
      throw new HttpException('User ID is required', HttpStatus.BAD_REQUEST);
    }
    const following = await this.prisma.follower.findMany({
      where: { followerId: userId },
      include: {
        following: { select: { id: true, name: true, username: true, profilePhoto: true } },
      },
    });
    return following.map(f => f.following);
  }

  async getUserStats(userId: string) {
    if (!userId) {
      throw new HttpException('User ID is required', HttpStatus.BAD_REQUEST);
    }
    const palettesCount = await this.prisma.palette.count({ where: { userId } });
    const followersCount = await this.prisma.follower.count({ where: { followingId: userId } });
    const followingCount = await this.prisma.follower.count({ where: { followerId: userId } });
    return {
      palettes: palettesCount,
      followers: followersCount,
      following: followingCount,
    };
  }

  async uploadProfilePhoto(userId: string, file: Express.Multer.File) {
    if (!userId) {
      throw new HttpException('User ID is required', HttpStatus.BAD_REQUEST);
    }
    if (!file) {
      throw new HttpException('No file provided', HttpStatus.BAD_REQUEST);
    }
  
    try {
      const uploadResult: UploadApiResponse = await new Promise((resolve, reject) => {
        const stream = this.cloudinaryInstance.uploader.upload_stream(
          {
            folder: 'profile',
            upload_preset: process.env.PROFILE_UPLOAD_PRESET,
          },
          (error: any, result: UploadApiResponse) => {
            if (error) return reject(new HttpException('Image upload failed', HttpStatus.INTERNAL_SERVER_ERROR));
            resolve(result);
          },
        );
  
        const bufferStream = new Readable();
        bufferStream.push(file.buffer);
        bufferStream.push(null);
        bufferStream.pipe(stream);
      });
  
      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: { profilePhoto: uploadResult.secure_url },
        select: { id: true, name: true, username: true, email: true, profilePhoto: true },
      });
  
      return { message: 'Profile photo updated successfully', user: updatedUser };
    } catch (error) {
      throw new HttpException('Failed to upload image', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async searchUsersByUsername(query: string) {
    if (!query) {
      throw new HttpException('Search query (q) is missing or invalid', HttpStatus.BAD_REQUEST);
    }
    const users = await this.prisma.user.findMany({
      where: {
        username: {
          contains: query,
          mode: 'insensitive',
        },
      },
      select: { id: true, name: true, username: true, profilePhoto: true },
    });
    if (users.length === 0) {
      return { message: 'Nenhum usuário encontrado.' };
    }
    return { users };
  }

  async getUserProfile(userId: string, loggedUserId: string) {
    if (!userId) {
      throw new HttpException('User ID é necessário', HttpStatus.BAD_REQUEST);
    }
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, username: true, profilePhoto: true },
    });
    if (!user) {
      throw new HttpException('Usuário não encontrado', HttpStatus.NOT_FOUND);
    }
    const isFollowing = await this.prisma.follower.findFirst({
      where: { followerId: loggedUserId, followingId: userId },
    });
    const followersCount = await this.prisma.follower.count({ where: { followingId: userId } });
    const followingCount = await this.prisma.follower.count({ where: { followerId: userId } });
    const publicPalettes = await this.prisma.palette.findMany({
      where: { userId, isPublic: true },
      select: {
        id: true,
        title: true,
        colors: true,
        photo: { select: { imageUrl: true } },
      },
    });
    const formattedPalettes = publicPalettes.map(palette => ({
      ...palette,
      imageUrl: palette.photo?.imageUrl || null,
    }));
    const totalPalettesCount = await this.prisma.palette.count({ where: { userId } });
    return {
      user: {
        ...user,
        followersCount,
        followingCount,
        totalPalettesCount,
        palettes: formattedPalettes,
        isFollowing: !!isFollowing,
      },
    };
  }
}
