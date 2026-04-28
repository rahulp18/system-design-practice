import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { CacheModule } from './cache/cache.module';

@Module({
  imports: [PrismaModule, UserModule, CacheModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
