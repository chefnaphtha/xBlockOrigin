chrome.storage.local.get(['xTheme'], (result) => {
	const theme = result.xTheme || 'dim'
	document.documentElement.setAttribute('data-theme', theme)
})

chrome.storage.onChanged.addListener((changes, areaName) => {
	if (areaName === 'local' && changes.xTheme) {
		document.documentElement.setAttribute(
			'data-theme',
			changes.xTheme.newValue
		)
	}
})
