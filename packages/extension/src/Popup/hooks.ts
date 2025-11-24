import { useEffect, useState } from 'preact/hooks'
import { getAllMutedUsers } from '../Storage/database'
import { getAllWhitelistedUsers } from '../Storage/whitelist'
import type { MutedUser, WhitelistedUser } from '../Storage/schema'

// generic hook for chrome.storage.sync
export function useStorage<T>(key: string, defaultValue: T) {
	const [value, setValue] = useState<T>(defaultValue)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		// load initial value
		chrome.storage.sync.get(key).then((result) => {
			if (result[key] !== undefined) {
				setValue(result[key])
			}
			setLoading(false)
		})

		// listen for changes
		const listener = (
			changes: { [key: string]: chrome.storage.StorageChange },
			areaName: string
		) => {
			if (areaName === 'sync' && changes[key]) {
				setValue(changes[key].newValue)
			}
		}

		chrome.storage.onChanged.addListener(listener)
		return () => chrome.storage.onChanged.removeListener(listener)
	}, [key])

	const updateValue = async (newValue: T) => {
		await chrome.storage.sync.set({ [key]: newValue })
		setValue(newValue)
	}

	return { value, setValue: updateValue, loading }
}

// hook for country blacklist
export function useBlacklist() {
	const { value, setValue, loading } = useStorage<string[]>('blacklist', [])

	const addCountry = async (country: string) => {
		if (!value.includes(country)) {
			const newList = [...value, country]
			await setValue(newList)
		}
	}

	const removeCountry = async (country: string) => {
		const newList = value.filter((c) => c !== country)
		await setValue(newList)
	}

	return {
		blacklist: value,
		addCountry,
		removeCountry,
		loading
	}
}

// hook for muted users from chrome.storage.local
export function useMutedUsers() {
	const [users, setUsers] = useState<MutedUser[]>([])
	const [loading, setLoading] = useState(true)

	const loadUsers = async () => {
		try {
			const allUsers = await getAllMutedUsers()
			setUsers(allUsers)
		} catch (error) {
			// ignore errors
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		loadUsers()

		// listen for storage changes and update incrementally
		const listener = (
			changes: { [key: string]: chrome.storage.StorageChange },
			areaName: string
		) => {
			if (areaName === 'local') {
				setUsers((currentUsers) => {
					let updated = [...currentUsers]

					for (const [key, change] of Object.entries(changes)) {
						if (!key.startsWith('muted:')) continue

						if (change.newValue) {
							// user added or updated
							const user = change.newValue as MutedUser
							const index = updated.findIndex(
								(u) => u.userId === user.userId
							)
							if (index >= 0) {
								updated[index] = user
							} else {
								updated.push(user)
							}
						} else if (change.oldValue) {
							// user removed
							const user = change.oldValue as MutedUser
							updated = updated.filter(
								(u) => u.userId !== user.userId
							)
						}
					}

					return updated
				})
			}
		}

		chrome.storage.onChanged.addListener(listener)
		return () => chrome.storage.onChanged.removeListener(listener)
	}, [])

	return { users, loading, reload: loadUsers }
}

// hook for whitelisted users from chrome.storage.sync
export function useWhitelist() {
	const [users, setUsers] = useState<WhitelistedUser[]>([])
	const [loading, setLoading] = useState(true)

	const loadUsers = async () => {
		try {
			const allUsers = await getAllWhitelistedUsers()
			setUsers(allUsers)
		} catch (error) {
			// ignore errors
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		loadUsers()

		// listen for storage changes
		const listener = (
			changes: { [key: string]: chrome.storage.StorageChange },
			areaName: string
		) => {
			if (areaName === 'sync' && changes.whitelist) {
				if (changes.whitelist.newValue) {
					setUsers(changes.whitelist.newValue as WhitelistedUser[])
				}
			}
		}

		chrome.storage.onChanged.addListener(listener)
		return () => chrome.storage.onChanged.removeListener(listener)
	}, [])

	return { users, loading, reload: loadUsers }
}
