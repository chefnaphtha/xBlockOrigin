console.log('[xBlockOrigin] Background script loaded')

chrome.runtime.onInstalled.addListener((details) => {
	if (details.reason === 'install') {
		console.log('[xBlockOrigin] Extension installed')
		chrome.storage.sync.set({
			blacklist: []
		})
	}
})

chrome.runtime.onMessage.addListener((_message, _sender, sendResponse) => {
	sendResponse({ success: true })
	return true
})
