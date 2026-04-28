/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';
import 'dotenv/config';

import { Pool } from 'pg';
import { PrismaClient } from '../generated/prisma/client';

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function main() {
  console.log('🌱 Seeding 50 users and 100+ posts...');

  const hashedPassword: string = await bcrypt.hash('password123', 10);

  const usersData: any[] = [];

  for (let i = 1; i <= 50; i++) {
    const postCount = getRandomInt(1, 4); // each user gets 1–4 posts

    usersData.push({
      name: `User${i}`,
      email: `user${i}@example.com`,
      password: hashedPassword,
      posts: {
        create: Array.from({ length: postCount }).map((_, j) => ({
          title: `Post ${j + 1} by User${i}`,
          content: `This is content for post ${j + 1} by user ${i}`,
          published: Math.random() > 0.3, // 70% published
        })),
      },
    });
  }

  // insert users
  for (const user of usersData) {
    await prisma.user.upsert({
      where: { email: user?.email as string },
      update: {},
      create: user,
    });
  }

  console.log('✅ Seeding completed!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });
