import type { UsernameCallback } from './extractors'

// extract username from profile page url
function extractUsernameFromURL(): string | null {
	const path = window.location.pathname

	// profile urls are /{username} or /{username}/...
	const match = path.match(/^\/([^/]+)/)
	const username = match?.[1]

	if (!username) {
		return null
	}

	// filter out x.com system pages
	const systemPages = [
		'home',
		'explore',
		'notifications',
		'messages',
		'settings',
		'compose',
		'i',
		'search'
	]

	if (systemPages.includes(username.toLowerCase())) {
		return null
	}

	return username
}

// scan profile page for username
export function scanProfile(onUserFound: UsernameCallback): () => void {
	const username = extractUsernameFromURL()

	if (username) {
		onUserFound(username)
	}

	// watch for url changes (spa navigation)
	let lastUrl = window.location.href
	const observer = setInterval(() => {
		if (window.location.href !== lastUrl) {
			lastUrl = window.location.href
			const newUsername = extractUsernameFromURL()
			if (newUsername) {
				onUserFound(newUsername)
			}
		}
	}, 1000)

	// return cleanup function
	return () => clearInterval(observer)
}
