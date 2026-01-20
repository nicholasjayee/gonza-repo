import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
    schema: 'prisma/schema.prisma',
    // migrations: {
    //   path: 'prisma/migrations',
    //   seed: 'tsx prisma/seed.ts',
    // },
    // seed: {
    //   command: 'tsx prisma/seed.ts', 
    // },
    // Note: 'seed' property might be inside 'migrations' or top-level depending on exact Prisma 7 beta version, 
    // checking docs provided by user: "migrations: { seed: ... }"
    migrations: {
        path: 'prisma/migrations',
        seed: 'tsx prisma/seed.ts',
    },
    datasource: {
        url: env('DATABASE_URL'),
    },
});
