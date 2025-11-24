import { startOrchestrator } from './orchestrator'
import { unhideAllPostsByUserId } from './postHider'
import { setupUnmuteMessageHandler } from './unmuteHandler'
import { watchThemeChanges } from '../Utils/themeDetector'
import type { WhitelistedUser } from '../Storage/schema'

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', init)
} else {
	init()
}

function init() {
	console.log('[xBlockOrigin] Content script loaded')
	startOrchestrator()
	setupUnmuteMessageHandler()
	setupWhitelistListener()

	setTimeout(() => {
		watchThemeChanges((theme) => {
			chrome.storage.local.set({ xTheme: theme })
		})
	}, 1000)
}

function setupWhitelistListener() {
	chrome.storage.onChanged.addListener((changes, areaName) => {
		if (areaName === 'sync' && changes.whitelist) {
			const oldWhitelist = (changes.whitelist.oldValue ||
				[]) as WhitelistedUser[]
			const newWhitelist = (changes.whitelist.newValue ||
				[]) as WhitelistedUser[]

			// find newly whitelisted users
			const oldIds = new Set(oldWhitelist.map((u) => u.userId))
			const newlyWhitelisted = newWhitelist.filter(
				(u) => !oldIds.has(u.userId)
			)

			// unhide posts from newly whitelisted users
			for (const user of newlyWhitelisted) {
				console.log(
					`[xBlockOrigin] Unhiding posts from newly whitelisted user @${user.username}`
				)
				unhideAllPostsByUserId(user.userId)
			}
		}
	})
}
