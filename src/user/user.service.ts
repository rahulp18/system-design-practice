/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CacheService } from '../cache/cache.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}

  async getAllUsers() {
    try {
      const users = await this.prisma.user.findMany({});
      return users;
    } catch (error: any) {
      throw new InternalServerErrorException(
        `Failed to fetch users: ${error.message}`,
      );
    }
  }
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
}
