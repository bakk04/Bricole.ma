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

  global.redis = client;

  return client;
};

// Internal getter that ensures client is created only when needed
const getClient = () => {
  if (typeof window !== 'undefined') return null; // Avoid client-side usage if any
  return getRedisClient();
}

export const cache = {
  async getOrSet(key, fallback, ttl = 3600) {
    const redis = getClient();
    if (!redis) return fallback();
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
  async set(key, value, ttl = 3600) { 
    const redis = getClient();
    return redis ? redis.set(key, JSON.stringify(value), 'EX', ttl) : null; 
  },
  async get(key) { 
    const redis = getClient();
    if (!redis) return null;
    const value = await redis.get(key);
    return value ? JSON.parse(value) : null;
  },
  async del(key) { 
    const redis = getClient();
    return redis ? redis.del(key) : null; 
  }
};

// Default export as a proxy or just keep it simple with explicit methods
// For backward compatibility with 'import redis from ...'
const redisProxy = {
  get: (...args) => getClient()?.get(...args),
  set: (...args) => getClient()?.set(...args),
  del: (...args) => getClient()?.del(...args),
  on: (...args) => getClient()?.on(...args),
  // Add other methods as needed or just export the getter
};

export default redisProxy;
