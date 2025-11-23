import * as v from 'valibot'
import { type MutedUser, mutedUserSchema } from './schema'

const KEY_PREFIX = 'muted:'

// generate storage key for a userId
function getUserKey(userId: string): string {
	return `${KEY_PREFIX}${userId}`
}

// check if a key is a muted user key
function isMutedUserKey(key: string): boolean {
	return key.startsWith(KEY_PREFIX)
}

export async function saveMutedUser(user: MutedUser): Promise<void> {
	const validated = v.parse(mutedUserSchema, user)
	await chrome.storage.local.set({
		[getUserKey(validated.userId)]: validated
	})
}

export async function getAllMutedUsers(): Promise<MutedUser[]> {
	const allData = await chrome.storage.local.get(null)
	const users: MutedUser[] = []

	for (const [key, value] of Object.entries(allData)) {
		if (isMutedUserKey(key)) {
			users.push(v.parse(mutedUserSchema, value))
		}
	}

	return users
}

// check if a user is already muted by userId
export async function isUserMuted(userId: string): Promise<boolean> {
	const result = await chrome.storage.local.get(getUserKey(userId))
	return getUserKey(userId) in result
}

// get muted users by country
export async function getMutedUsersByCountry(
	country: string
): Promise<MutedUser[]> {
	const allData = await chrome.storage.local.get(null)
	const users: MutedUser[] = []

	for (const [key, value] of Object.entries(allData)) {
		if (isMutedUserKey(key)) {
			const user = v.parse(mutedUserSchema, value)
			if (user.country === country) {
				users.push(user)
			}
		}
	}

	return users
}
