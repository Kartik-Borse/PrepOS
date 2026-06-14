/**
 * Vercel serverless entry point — wraps the Express app.
 * Vercel treats every file in /api as a serverless function.
 * We export the full Express app here so all routes work under /api/*
 */
import app from '../src/index.js';

export default app;
