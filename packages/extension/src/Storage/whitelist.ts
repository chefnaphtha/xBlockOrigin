import * as v from 'valibot'
import { type WhitelistedUser, whitelistedUserSchema } from './schema'

const WHITELIST_KEY = 'whitelist'

// get all whitelisted users
export async function getAllWhitelistedUsers(): Promise<WhitelistedUser[]> {
	const result = await chrome.storage.sync.get(WHITELIST_KEY)
	const data = result[WHITELIST_KEY]

	if (!data) {
		return []
	}

	return v.parse(v.array(whitelistedUserSchema), data)
}

// check if a user is whitelisted by userId
export async function isWhitelisted(userId: string): Promise<boolean> {
	const whitelist = await getAllWhitelistedUsers()
	return whitelist.some((user) => user.userId === userId)
}

// add a user to the whitelist
export async function addToWhitelist(
	userId: string,
	username: string
): Promise<void> {
	const whitelist = await getAllWhitelistedUsers()

	// check if already whitelisted
	if (whitelist.some((user) => user.userId === userId)) {
		return
	}

	const newUser: WhitelistedUser = {
		userId,
		username,
		whitelistedAt: Date.now()
	}

	whitelist.push(v.parse(whitelistedUserSchema, newUser))
	await chrome.storage.sync.set({ [WHITELIST_KEY]: whitelist })
}

// remove a user from the whitelist
export async function removeFromWhitelist(userId: string): Promise<void> {
	const whitelist = await getAllWhitelistedUsers()
	const filtered = whitelist.filter((user) => user.userId !== userId)
	await chrome.storage.sync.set({ [WHITELIST_KEY]: filtered })
}

// get a whitelisted user by userId
export async function getWhitelistedUser(
	userId: string
): Promise<WhitelistedUser | undefined> {
	const whitelist = await getAllWhitelistedUsers()
	return whitelist.find((user) => user.userId === userId)
}
