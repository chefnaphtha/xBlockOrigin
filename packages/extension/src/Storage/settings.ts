import * as v from 'valibot'
import { type Settings, settingsSchema } from './schema'

const SETTINGS_KEY = 'settings'

// default settings
const DEFAULT_SETTINGS: Settings = {
	showFlags: false,
	muteFollowing: false
}

// get all settings
export async function getSettings(): Promise<Settings> {
	const result = await chrome.storage.sync.get(SETTINGS_KEY)
	const data = result[SETTINGS_KEY]

	if (!data) {
		return DEFAULT_SETTINGS
	}

	return v.parse(settingsSchema, { ...DEFAULT_SETTINGS, ...data })
}

// update settings
export async function updateSettings(
	updates: Partial<Settings>
): Promise<void> {
	const current = await getSettings()
	const updated = { ...current, ...updates }
	const validated = v.parse(settingsSchema, updated)
	await chrome.storage.sync.set({ [SETTINGS_KEY]: validated })
}

// get individual setting values
export async function getShowFlags(): Promise<boolean> {
	const settings = await getSettings()
	return settings.showFlags
}

export async function getMuteFollowing(): Promise<boolean> {
	const settings = await getSettings()
	return settings.muteFollowing
}
