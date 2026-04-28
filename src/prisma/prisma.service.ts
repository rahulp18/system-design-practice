import { Injectable } from '@nestjs/common';

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client';
import { env } from '../config/env';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    const adapter = new PrismaPg({
      connectionString: env.DATABASE_URL,
    });
    super({ adapter });
  }
}
