import * as redisStore from 'cache-manager-redis-store';

export default () => ({
  redis: {
    secret: process.env.SECRET_KEY,
    signOption: {
      store: redisStore,
      host: process.env.DB_HOST,
      port: process.env.DB_REDIS_PORT,
      auth_pass: process.env.DB_REDIS_PASSWORD,
      ttl: 3600 * 24 * 50,
    },
  },
});
