/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import KeyvRedis from '@keyv/redis';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { KeyvCacheableMemory } from 'cacheable';
import Keyv from 'keyv';
import { CacheService } from './cache.service';

@Global()
@Module({
  imports: [
    ConfigModule,
    NestCacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const redisUrl =
          configService.get<string>('REDIS_URL') || 'redis://localhost:6379';

        const memoryStore = new Keyv({
          store: new KeyvCacheableMemory({
            ttl: 1000 * 60 * 2, // 2 min in-memory cache
            lruSize: 10_000,
          }),
        });

        const redisStore = new KeyvRedis(redisUrl);

        return {
          stores: [
            memoryStore, // fast L1 cache
            redisStore, // shared L2 cache
          ],
          ttl: 60 * 2 * 1000, // global default TTL = 2 min
        };
      },
    }),
  ],
  providers: [CacheService],
  exports: [CacheService],
})
export class CacheModule {}
