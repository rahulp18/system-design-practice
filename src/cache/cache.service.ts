/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);

  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.cache.get<T>(key);
      return value ?? null;
    } catch (error: any) {
      this.logger.error(`Failed to get cache for key ${key}: ${error.message}`);
      return null;
    }
  }
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      if (ttl) {
        await this.cache.set(key, value, ttl);
      } else {
        await this.cache.set(key, value);
      }
    } catch (error: any) {
      this.logger.error(`Failed to set cache for key ${key}: ${error.message}`);
    }
  }
  async del(key: string): Promise<void> {
    try {
      await this.cache.del(key);
    } catch (error: any) {
      this.logger.error(
        `Failed to delete cache for key ${key}: ${error.message}`,
      );
    }
  }
  async reset(): Promise<void> {
    try {
      await this.cache.clear();
    } catch (error: any) {
      this.logger.error(`Failed to reset cache: ${error.message}`);
    }
  }
  async remember<T>(
    key: string,
    factory: () => Promise<T>,
    ttl?: number,
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      this.logger.debug(`Cache hit for key ${key}`);
      return cached;
    }
    this.logger.debug(`Cache miss for key ${key}`);
    const fresh = await factory();
    await this.set(key, fresh, ttl);
    return fresh;
  }
}
