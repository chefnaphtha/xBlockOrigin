import { startOrchestrator } from './orchestrator'
import { setupUnmuteMessageHandler } from './unmuteHandler'
import { watchThemeChanges } from '../Utils/themeDetector'

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', init)
} else {
	init()
}

function init() {
	console.log('[xBlockOrigin] Content script loaded')
	startOrchestrator()
	setupUnmuteMessageHandler()

	setTimeout(() => {
		watchThemeChanges((theme) => {
			chrome.storage.local.set({ xTheme: theme })
		})
	}, 1000)
}
