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

// schema for whitelisted user record
export const whitelistedUserSchema = v.object({
	username: v.string(),
	userId: v.string(),
	whitelistedAt: v.number()
})

// schema for extension settings
export const settingsSchema = v.object({
	showFlags: v.boolean(),
	muteFollowing: v.boolean()
})

// type exports
export type MutedUser = v.InferOutput<typeof mutedUserSchema>
export type Blacklist = v.InferOutput<typeof blacklistSchema>
export type WhitelistedUser = v.InferOutput<typeof whitelistedUserSchema>
export type Settings = v.InferOutput<typeof settingsSchema>
