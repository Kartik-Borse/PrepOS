import express from 'express';
import { checkDatabaseConnection, checkRedisConnection } from '../utils/healthChecks.js';

const router = express.Router();

/**
 * Health check endpoint
 * Returns the overall health status of the application and its dependencies
 */
router.get('/', async (req, res) => {
  const timestamp = new Date().toISOString();

  try {
    // Check database connection
    const dbHealthy = await checkDatabaseConnection();
    
    // Check Redis connection
    const redisHealthy = await checkRedisConnection();

    // Overall status is healthy only if all checks pass
    const isHealthy = dbHealthy && redisHealthy;

    const healthStatus = {
      status: isHealthy ? 'healthy' : 'degraded',
      timestamp,
      services: {
        api: 'healthy',
        database: dbHealthy ? 'healthy' : 'unhealthy',
        redis: redisHealthy ? 'healthy' : 'unhealthy',
      },
    };

    res.status(isHealthy ? 200 : 503).json(healthStatus);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
