import Redis from 'ioredis';

const getRedisClient = () => {
  if (global.redis) {
    return global.redis;
  }

  // Utilisation directe des variables de votre .env
  const client = new Redis({
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT || '14172'),
    username: process.env.REDIS_USER || 'default',
    password: process.env.REDIS_PASSWORD,
    retryStrategy: (times) => Math.min(times * 50, 2000),
    maxRetriesPerRequest: 3,
  });

  client.on('error', (err) => console.error('❌ Redis Client Error:', err));
  client.on('connect', () => console.log('✅ Connected to Redis Cloud'));

  if (process.env.NODE_ENV !== 'production') {
    global.redis = client;
  }

  return client;
};

let redis = getRedisClient();

export const cache = {
  async getOrSet(key, fallback, ttl = 3600) {
    try {
      const cachedValue = await redis.get(key);
      if (cachedValue) return JSON.parse(cachedValue);

      const result = await fallback();
      if (result) await redis.set(key, JSON.stringify(result), 'EX', ttl);
      return result;
    } catch (error) {
      console.error(`Redis cache error [${key}]:`, error);
      return fallback();
    }
  },
  async set(key, value, ttl = 3600) { return redis.set(key, JSON.stringify(value), 'EX', ttl); },
  async get(key) { 
    const value = await redis.get(key);
    return value ? JSON.parse(value) : null;
  },
  async del(key) { return redis.del(key); }
};

export default redis;
