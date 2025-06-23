const redis = require('redis');

let redisClient;
let isRedisConnected = false;

/**
 * Connects to the Redis server.
 * Handles connection events and errors.
 */
const connectRedis = async () => {
  if (isRedisConnected) {
    console.log('Redis client is already connected.');
    return;
  }
  
  const redisURL = process.env.REDIS_URL || 'redis://localhost:6379';
  redisClient = redis.createClient({ url: redisURL });

  redisClient.on('error', (err) => {
    console.error('Redis Client Error', err);
    isRedisConnected = false;
  });

  redisClient.on('connect', () => {
    console.log('Connecting to Redis...');
  });

  redisClient.on('ready', () => {
    isRedisConnected = true;
    console.log('Redis client connected successfully.');
  });
  
  redisClient.on('end', () => {
    console.log('Redis client disconnected.');
    isRedisConnected = false;
  });

  try {
    await redisClient.connect();
  } catch (err) {
    console.error('Failed to connect to Redis:', err);
  }
};

/**
 * Disconnects from the Redis server.
 */
const disconnectRedis = async () => {
  if (redisClient && isRedisConnected) {
    await redisClient.quit();
  }
};

/**
 * Retrieves a value from the Redis cache.
 * @param {string} key The cache key.
 * @returns {Promise<any|null>} The cached data, or null if not found.
 */
const getCache = async (key) => {
  if (!isRedisConnected) return null;
  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.error(`Error getting cache for key ${key}:`, err);
    return null;
  }
};

/**
 * Stores a value in the Redis cache.
 * @param {string} key The cache key.
 * @param {any} value The value to cache (must be JSON-serializable).
 * @param {number} expirationInSeconds The cache expiration time in seconds.
 */
const setCache = async (key, value, expirationInSeconds) => {
  if (!isRedisConnected) return;
  try {
    await redisClient.setEx(
      key,
      expirationInSeconds,
      JSON.stringify(value)
    );
  } catch (err) {
    console.error(`Error setting cache for key ${key}:`, err);
  }
};

module.exports = {
  connectRedis,
  disconnectRedis,
  getCache,
  setCache
}; 