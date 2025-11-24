type CacheEntry<T> = {
	value: T
	expiresAt: number
}

const CACHE_TTL_24H = 24 * 60 * 60 * 1000 // 24 hours in milliseconds
const CACHE_TTL_5M = 5 * 60 * 1000 // 5 minutes in milliseconds

// persistent cache with ttl using chrome.storage.local
export function createCache<T>(prefix: string, ttl: number) {
	const buildKey = (key: string) => `${prefix}${key}`

	return {
		async get(key: string): Promise<T | null> {
			const storageKey = buildKey(key)
			const result = await chrome.storage.local.get(storageKey)
			const entry = result[storageKey] as CacheEntry<T> | undefined

			if (!entry) {
				return null
			}

			if (Date.now() > entry.expiresAt) {
				// lazy cleanup - delete expired entry
				await chrome.storage.local.remove(storageKey)
				return null
			}

			return entry.value
		},

		async set(key: string, value: T): Promise<void> {
			const storageKey = buildKey(key)
			await chrome.storage.local.set({
				[storageKey]: {
					value,
					expiresAt: Date.now() + ttl
				}
			})
		},

		async has(key: string): Promise<boolean> {
			const storageKey = buildKey(key)
			const result = await chrome.storage.local.get(storageKey)
			const entry = result[storageKey] as CacheEntry<T> | undefined

			if (!entry) {
				return false
			}

			if (Date.now() > entry.expiresAt) {
				// lazy cleanup - delete expired entry
				await chrome.storage.local.remove(storageKey)
				return false
			}

			return true
		},

		async clear(): Promise<void> {
			// get all keys from storage
			const allData = await chrome.storage.local.get(null)
			const keysToRemove = Object.keys(allData).filter((key) =>
				key.startsWith(prefix)
			)
			if (keysToRemove.length > 0) {
				await chrome.storage.local.remove(keysToRemove)
			}
		}
	}
}

// global cache instance for country lookups (24 hour ttl)
export const countryCache = createCache<string>('cache:country:', CACHE_TTL_24H)

// global cache instance for userId lookups - username -> userId (24 hour ttl)
export const userIdCache = createCache<string>('cache:user:', CACHE_TTL_24H)

// global cache instance for following status - userId -> boolean (5 minute ttl)
export const followingCache = createCache<boolean>(
	'cache:following:',
	CACHE_TTL_5M
)
