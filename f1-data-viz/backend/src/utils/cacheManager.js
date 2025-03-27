/**
 * Simple in-memory cache manager with expiration
 */

// Cache storage
const cache = {};

// Default cache expiration time in milliseconds (5 minutes)
const DEFAULT_EXPIRATION = 5 * 60 * 1000;

/**
 * Set a value in the cache with expiration
 * @param {string} key - Cache key
 * @param {any} value - Value to cache
 * @param {number} expiration - Expiration time in milliseconds (default: 5 minutes)
 */
const set = (key, value, expiration = DEFAULT_EXPIRATION) => {
  const expiresAt = Date.now() + expiration;

  cache[key] = {
    value,
    expiresAt,
  };

  console.log(`Cache set: ${key} (expires in ${expiration / 1000}s)`);
};

/**
 * Get a value from the cache
 * @param {string} key - Cache key
 * @returns {any|null} - Cached value or null if not found or expired
 */
const get = (key) => {
  const item = cache[key];

  // Check if item exists and is not expired
  if (item && item.expiresAt > Date.now()) {
    console.log(`Cache hit: ${key}`);
    return item.value;
  }

  // Item doesn't exist or is expired
  if (item) {
    console.log(`Cache expired: ${key}`);
    delete cache[key]; // Clean up expired item
  } else {
    console.log(`Cache miss: ${key}`);
  }

  return null;
};

/**
 * Check if a key exists in the cache and is not expired
 * @param {string} key - Cache key
 * @returns {boolean} - True if key exists and is not expired
 */
const has = (key) => {
  const item = cache[key];
  return item && item.expiresAt > Date.now();
};

/**
 * Remove a key from the cache
 * @param {string} key - Cache key to remove
 */
const remove = (key) => {
  if (key in cache) {
    delete cache[key];
    console.log(`Cache removed: ${key}`);
    return true;
  }
  return false;
};

/**
 * Clear all cached items
 */
const clear = () => {
  Object.keys(cache).forEach((key) => {
    delete cache[key];
  });
  console.log("Cache cleared");
};

/**
 * Get cache stats
 * @returns {object} - Cache statistics
 */
const getStats = () => {
  const now = Date.now();
  const keys = Object.keys(cache);
  const total = keys.length;
  const expired = keys.filter((key) => cache[key].expiresAt <= now).length;
  const active = total - expired;

  return {
    total,
    active,
    expired,
  };
};

/**
 * Remove all expired items from the cache
 * @returns {number} - Number of items removed
 */
const cleanExpired = () => {
  const now = Date.now();
  let removed = 0;

  Object.keys(cache).forEach((key) => {
    if (cache[key].expiresAt <= now) {
      delete cache[key];
      removed++;
    }
  });

  if (removed > 0) {
    console.log(`Cleaned ${removed} expired cache items`);
  }

  return removed;
};

module.exports = {
  set,
  get,
  has,
  remove,
  clear,
  getStats,
  cleanExpired,
  DEFAULT_EXPIRATION,
};
