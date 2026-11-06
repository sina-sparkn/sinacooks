export default () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  database: {
    url: process.env.DATABASE_URL,
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET || 'default_secret',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    cookieName: process.env.COOKIE_NAME || 'recipe_token',
    cookieSameSite: (process.env.COOKIE_SAME_SITE as 'lax' | 'strict' | 'none') || (process.env.NODE_ENV === 'production' ? 'none' : 'lax'),
    cookieSecure: process.env.COOKIE_SECURE ? process.env.COOKIE_SECURE === 'true' : process.env.NODE_ENV === 'production',
  },
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  cms: {
    strapiUrl: process.env.STRAPI_URL || 'http://localhost:1337',
    strapiPublicUrl: process.env.STRAPI_PUBLIC_URL || 'http://localhost:1337',
    strapiApiToken: process.env.STRAPI_API_TOKEN || '',
    webhookSecret: process.env.STRAPI_WEBHOOK_SECRET || '',
    cacheTtlSeconds: parseInt(process.env.CACHE_TTL_SECONDS || '60', 10),
  },
});
