import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import * as dotenv from 'dotenv';

dotenv.config();

neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding demo user...');
  
  try {
    // Check current schema
    const currentSchema: any = await prisma.$queryRaw`SELECT current_schema()::text`;
    console.log('Current schema:', currentSchema);

    // List all schemas
    const schemas: any = await prisma.$queryRaw`SELECT schema_name::text FROM information_schema.schemata`;
    console.log('Available schemas:', schemas);

    // Try to find where the users table is
    const tables: any = await prisma.$queryRaw`
      SELECT table_schema::text, table_name::text 
      FROM information_schema.tables 
      WHERE table_name = 'users'
    `;
    console.log('Found "users" table in:', tables);

    for (const table of tables) {
      const schema = table.table_schema;
      console.log(`Attempting to insert into ${schema}.users...`);
      try {
        await prisma.$executeRawUnsafe(`
          INSERT INTO "${schema}".users (id, email, name)
          VALUES ('demo-user-001', 'demo@example.com', 'Demo User')
          ON CONFLICT (id) DO NOTHING;
        `);
        console.log(`Successfully inserted into ${schema}.users`);
      } catch (e) {
        console.error(`Failed to insert into ${schema}.users:`, e);
      }
    }

    // Verify
    const allUsers = await prisma.user.findMany();
    console.log('All users Prisma sees now:', allUsers.map((u: any) => u.id));

  } catch (error) {
    console.error('Error seeding:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
