type CacheEntry<T> = {
	value: T
	expiresAt: number
}

const CACHE_TTL = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

// simple in-memory cache with ttl
export function createCache<T>() {
	const cache = new Map<string, CacheEntry<T>>()

	return {
		get(key: string): T | null {
			const entry = cache.get(key)

			if (!entry) {
				return null
			}

			if (Date.now() > entry.expiresAt) {
				cache.delete(key)
				return null
			}

			return entry.value
		},

		set(key: string, value: T): void {
			cache.set(key, {
				value,
				expiresAt: Date.now() + CACHE_TTL
			})
		},

		has(key: string): boolean {
			const entry = cache.get(key)

			if (!entry) {
				return false
			}

			if (Date.now() > entry.expiresAt) {
				cache.delete(key)
				return false
			}

			return true
		},

		clear(): void {
			cache.clear()
		}
	}
}

// global cache instance for country lookups
export const countryCache = createCache<string>()

// global cache instance for userId lookups (username -> userId)
export const userIdCache = createCache<string>()
