import * as v from 'valibot'

// schema for muted user record stored in indexeddb
export const mutedUserSchema = v.object({
	username: v.string(),
	userId: v.string(),
	country: v.string(),
	mutedAt: v.number()
})

// schema for country blacklist stored in chrome.storage
export const blacklistSchema = v.array(v.string())

// type exports
export type MutedUser = v.InferOutput<typeof mutedUserSchema>
export type Blacklist = v.InferOutput<typeof blacklistSchema>
