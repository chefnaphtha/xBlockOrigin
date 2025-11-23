import { useEffect, useState } from 'preact/hooks'
import { getAllMutedUsers } from '../Storage/database'
import type { MutedUser } from '../Storage/schema'

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

// hook for muted users from indexeddb
export function useMutedUsers() {
	const [users, setUsers] = useState<MutedUser[]>([])
	const [loading, setLoading] = useState(true)

	const loadUsers = async (isInitial = false) => {
		if (isInitial) {
			setLoading(true)
		}
		try {
			const allUsers = await getAllMutedUsers()
			setUsers(allUsers)
		} catch (error) {
			// ignore errors
		} finally {
			if (isInitial) {
				setLoading(false)
			}
		}
	}

	useEffect(() => {
		loadUsers(true)
		const interval = setInterval(() => {
			loadUsers(false)
		}, 2000)
		return () => {
			clearInterval(interval)
		}
	}, [])

	return { users, loading, reload: loadUsers }
}
