/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CacheService } from '../cache/cache.service';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDTO } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}

  async getUserById(id: string) {
    try {
      const key = `user:${id}`;

      const user = await this.cache.remember(
        key,
        () =>
          this.prisma.user.findUnique({
            where: { id },
          }),
        60 * 1 * 1000, // cache for 1 min
      );
      return user;
    } catch (error: any) {
      throw new InternalServerErrorException(
        `Failed to fetch user by ID: ${error.message}`,
      );
    }
  }
  async updateUser(id: string, updateUserDTO: UpdateUserDTO) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
      });
      if (!user) {
        throw new InternalServerErrorException(`User with ID ${id} not found`);
      }
      const updatedUser = await this.prisma.user.update({
        where: { id },
        data: updateUserDTO,
      });
      // Cache aside
      await this.cache.del(`user:${id}`);
      // cache aside for user list pages that might include this user
      const version = (await this.cache.get<number>('users:version')) || 1;
      await this.cache.set('users:version', version + 1);
      return updatedUser;
    } catch (error: any) {
      throw new InternalServerErrorException(
        `Failed to update user: ${error.message}`,
      );
    }
  }
  async deleteUser(id: string) {
    try {
      const user = await this.prisma.user.delete({
        where: { id },
      });
      await this.cache.del(`user:${id}`);
      const version = (await this.cache.get<number>('users:version')) || 1;
      await this.cache.set('users:version', version + 1);
      return user;
    } catch (error: any) {
      throw new InternalServerErrorException(
        `Failed to delete user: ${error.message}`,
      );
    }
  }
  async getAllUsers(page = 1, limit = 10) {
    try {
      const version = (await this.cache.get<number>('users:version')) || 1;
      const key = `users:v${version}:page:${page}:limit:${limit}`;

      const users = await this.cache.remember(
        key,
        async () => {
          return this.prisma.user.findMany({
            orderBy: { createdAt: 'asc' },
            skip: (page - 1) * limit,
            take: limit,
          });
        },
        60 * 2 * 1000, // cache for 2 minutes
      );

      return users;
    } catch (error: any) {
      throw new InternalServerErrorException(
        `Failed to fetch users: ${error.message}`,
      );
    }
  }
}
