import pg from 'pg';
import { createClient } from 'redis';

const { Pool } = pg;

/**
 * Check if PostgreSQL database connection is healthy
 */
export async function checkDatabaseConnection(): Promise<boolean> {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 3000,
  });

  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    await pool.end();
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    await pool.end();
    return false;
  }
}

/**
 * Check if Redis connection is healthy
 */
export async function checkRedisConnection(): Promise<boolean> {
  const client = createClient({
    url: process.env.REDIS_URL,
    socket: {
      connectTimeout: 3000,
    },
  });

  try {
    await client.connect();
    await client.ping();
    await client.quit();
    return true;
  } catch (error) {
    console.error('Redis health check failed:', error);
    try {
      await client.quit();
    } catch {
      // Ignore disconnect errors
    }
    return false;
  }
}
