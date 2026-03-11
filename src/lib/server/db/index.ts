import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '$env/dynamic/private';
import * as schema from './schema';

const connectionString = env.DATABASE_URL ?? 'postgresql://postgres:password@localhost:5432/acnescan';

const client = postgres(connectionString);
export const db = drizzle(client, { schema });
