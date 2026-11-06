import Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(3000),
  DATABASE_URL: Joi.string().required(),
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRES_IN: Joi.string().default('7d'),
  COOKIE_NAME: Joi.string().default('recipe_token'),
  COOKIE_SAME_SITE: Joi.string().valid('lax', 'strict', 'none').default('lax'),
  COOKIE_SECURE: Joi.boolean().default(false),
  CLIENT_URL: Joi.string().default('http://localhost:5173'),
  STRAPI_URL: Joi.string().default('http://localhost:1337'),
  STRAPI_PUBLIC_URL: Joi.string().default('http://localhost:1337'),
  STRAPI_API_TOKEN: Joi.string().allow('').default(''),
  STRAPI_WEBHOOK_SECRET: Joi.string().allow('').default(''),
  CACHE_TTL_SECONDS: Joi.number().default(60),
});
