// Cloudflare Worker using serverless-http
const serverless = require('serverless-http');
const serverApp = require('../server');

module.exports = {
  fetch: async (request, env, ctx) => {
    // Set environment variables from Cloudflare
    process.env.SUPABASE_URL = env.SUPABASE_URL;
    process.env.SUPABASE_KEY = env.SUPABASE_KEY;
    process.env.CF_WORKERS = 'true';
    // process.env.NODE_ENV = 'production';

    const handler = serverless(serverApp);
    return handler(request, ctx);
  }
};