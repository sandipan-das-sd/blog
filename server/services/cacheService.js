import NodeCache from 'node-cache';

// Create cache instance with 10 minute default TTL
const cache = new NodeCache({ 
    stdTTL: 600, // 10 minutes
    checkperiod: 120, // Check for expired keys every 2 minutes
    useClones: false
});

class CacheService {
    // Get data from cache
    get(key) {
        return cache.get(key);
    }

    // Set data in cache with optional TTL
    set(key, value, ttl = 600) {
        return cache.set(key, value, ttl);
    }

    // Delete specific key
    del(key) {
        return cache.del(key);
    }

    // Delete keys matching pattern
    delByPattern(pattern) {
        const keys = cache.keys();
        const matchingKeys = keys.filter(key => key.includes(pattern));
        return cache.del(matchingKeys);
    }

    // Clear all cache
    flush() {
        return cache.flushAll();
    }

    // Get cache statistics
    getStats() {
        return cache.getStats();
    }

    // Middleware for caching GET requests
    cacheMiddleware(duration = 600) {
        return (req, res, next) => {
            // Only cache GET requests
            if (req.method !== 'GET') {
                return next();
            }

            const key = `cache:${req.originalUrl || req.url}`;
            const cachedResponse = this.get(key);

            if (cachedResponse) {
                return res.json(cachedResponse);
            }

            // Store original res.json
            const originalJson = res.json.bind(res);

            // Override res.json
            res.json = (data) => {
                // Cache successful responses
                if (res.statusCode === 200) {
                    this.set(key, data, duration);
                }
                return originalJson(data);
            };

            next();
        };
    }

    // Clear cache by tags/patterns
    invalidateCache(patterns = []) {
        patterns.forEach(pattern => {
            this.delByPattern(pattern);
        });
    }
}

export default new CacheService();
