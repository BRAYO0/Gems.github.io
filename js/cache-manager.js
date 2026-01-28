/* Cache Manager Module - Centralized caching with TTL support */

const CacheManager = {
    // Cache TTL in milliseconds
    TTL: {
        MATCHES: 15 * 60 * 1000,      // 15 minutes
        HIGHLIGHTS: 20 * 60 * 1000,   // 20 minutes
    },

    /**
     * Store data in cache with timestamp
     */
    set(key, data, ttl = null) {
        try {
            const cacheData = {
                data: data,
                timestamp: Date.now(),
                ttl: ttl
            };

            // Use sessionStorage for live data, localStorage for highlights
            const storage = key.includes('highlights') ? localStorage : sessionStorage;
            storage.setItem(key, JSON.stringify(cacheData));
            return true;
        } catch (e) {
            console.error('Cache set error:', e);
            return false;
        }
    },

    /**
     * Get data from cache
     */
    get(key) {
        try {
            const storage = key.includes('highlights') ? localStorage : sessionStorage;
            const cached = storage.getItem(key);
            if (!cached) return null;

            const cacheData = JSON.parse(cached);

            // Check if cache is still valid
            if (this.isValid(key)) {
                // Re-hydrate Date objects (they get serialized to strings in storage)
                const data = cacheData.data;
                if (Array.isArray(data)) {
                    data.forEach(item => {
                        if (item.kickoffDate && typeof item.kickoffDate === 'string') {
                            item.kickoffDate = new Date(item.kickoffDate);
                        }
                    });
                }
                return data;
            } else {
                // Cache expired, remove it
                this.clear(key);
                return null;
            }
        } catch (e) {
            console.error('Cache get error:', e);
            return null;
        }
    },

    /**
     * Check if cache is still valid
     */
    isValid(key) {
        try {
            const storage = key.includes('highlights') ? localStorage : sessionStorage;
            const cached = storage.getItem(key);
            if (!cached) return false;

            const cacheData = JSON.parse(cached);
            const age = Date.now() - cacheData.timestamp;
            const ttl = cacheData.ttl || (key.includes('highlights') ? this.TTL.HIGHLIGHTS : this.TTL.MATCHES);

            return age < ttl;
        } catch (e) {
            return false;
        }
    },

    /**
     * Clear specific cache
     */
    clear(key) {
        try {
            const storage = key.includes('highlights') ? localStorage : sessionStorage;
            storage.removeItem(key);
            return true;
        } catch (e) {
            console.error('Cache clear error:', e);
            return false;
        }
    },

    /**
     * Clear all caches
     */
    clearAll() {
        try {
            sessionStorage.removeItem('live_matches');
            localStorage.removeItem('highlights');
            return true;
        } catch (e) {
            console.error('Cache clear all error:', e);
            return false;
        }
    },

    /**
     * Compare two datasets and return differences
     */
    diff(oldData, newData) {
        if (!oldData || !newData) return null;

        const changes = {
            added: [],
            removed: [],
            updated: []
        };

        // Create maps for O(1) lookup
        const oldMap = new Map(oldData.map(item => [item.id, item]));
        const newMap = new Map(newData.map(item => [item.id, item]));

        // Find added and updated
        newData.forEach(newItem => {
            const oldItem = oldMap.get(newItem.id);
            if (!oldItem) {
                changes.added.push(newItem);
            } else if (this.hasChanged(oldItem, newItem)) {
                changes.updated.push({ old: oldItem, new: newItem });
            }
        });

        // Find removed
        oldData.forEach(oldItem => {
            if (!newMap.has(oldItem.id)) {
                changes.removed.push(oldItem);
            }
        });

        return changes;
    },

    /**
     * Check if an item has changed (for matches/highlights)
     */
    hasChanged(oldItem, newItem) {
        // For matches, check score and status changes
        if (oldItem.home_score !== newItem.home_score) return true;
        if (oldItem.away_score !== newItem.away_score) return true;
        if (oldItem.time_period !== newItem.time_period) return true;
        if (oldItem.status !== newItem.status) return true;

        return false;
    }
};

// Export for use in other scripts
window.CacheManager = CacheManager;
