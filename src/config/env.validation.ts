import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().port().default(3000),
  DATABASE_URL: Joi.string()
    .uri({
      scheme: ['postgresql', 'postgres'],
    })
    .required(),
  JWT_ACCESS_TOKEN_SECRET: Joi.string().min(32).required(),
  JWT_ACCESS_TOKEN_TTL_SECONDS: Joi.number().integer().positive().default(900),
  REFRESH_TOKEN_TTL_DAYS: Joi.number().integer().positive().default(30),
  BCRYPT_SALT_ROUNDS: Joi.number().integer().min(10).max(14).default(12),
  STRIPE_SECRET_KEY: Joi.string().min(1).required(),
  STRIPE_WEBHOOK_SECRET: Joi.string().min(1).required(),
  STRIPE_CHECKOUT_SUCCESS_URL: Joi.string().uri().required(),
  STRIPE_CHECKOUT_CANCEL_URL: Joi.string().uri().required(),
  CORS_ORIGINS: Joi.string().default('http://localhost:5173'),
  THROTTLE_TTL_SECONDS: Joi.number().integer().positive().default(60),
  THROTTLE_LIMIT: Joi.number().integer().positive().default(100),
});
