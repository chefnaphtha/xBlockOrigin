import { getCountry } from '../Api/countryQuery'
import { muteUser } from '../Api/muteQuery'
import { getUserId } from '../Api/userQuery'
import { isUserMuted, saveMutedUser } from '../Storage/database'
import { countryCache, userIdCache } from '../Utils/cache'
import { apiQueue } from '../Utils/rateLimit'
import { scanProfile } from './profileScanner'
import { scanReplies } from './replyScanner'
import { scanSearch } from './searchScanner'
import { scanTimeline } from './timelineScanner'

async function getBlacklist(): Promise<string[]> {
	const result = await chrome.storage.sync.get('blacklist')
	return result.blacklist || []
}

function showToast(message: string) {
	const toast = document.createElement('div')
	toast.textContent = message
	toast.style.cssText = `
		position: fixed;
		bottom: 20px;
		right: 20px;
		background: #1d9bf0;
		color: white;
		padding: 12px 16px;
		border-radius: 8px;
		font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
		font-size: 14px;
		z-index: 999999;
		box-shadow: 0 4px 12px rgba(0,0,0,0.15);
	`

	document.body.appendChild(toast)

	setTimeout(() => {
		toast.remove()
	}, 3000)
}

async function processUser(username: string) {
	// get userId first - we need it to check if already muted and for muting
	let userId = userIdCache.get(username)

	if (!userId) {
		userId = await apiQueue.enqueue(() => getUserId(username))

		if (!userId) {
			console.error(
				`[xBlockOrigin] Failed to get user ID for @${username}`
			)
			return
		}

		userIdCache.set(username, userId)
	}

	// check if this userId is already muted
	const alreadyMuted = await isUserMuted(userId)
	if (alreadyMuted) {
		return
	}

	let country = countryCache.get(username)

	if (!country) {
		country = await apiQueue.enqueue(() => getCountry(username))

		if (!country) {
			console.log(
				`[xBlockOrigin] Could not fetch country for @${username}`
			)
			return
		}

		console.log(`[xBlockOrigin] @${username} is from ${country}`)
		countryCache.set(username, country)
	}

	const blacklist = await getBlacklist()

	const isBlacklisted = blacklist.some(
		(c) => c.toLowerCase() === country.toLowerCase()
	)

	if (!isBlacklisted) {
		return
	}

	console.log(
		`[xBlockOrigin] Attempting to mute @${username} (${userId}) from ${country}...`
	)
	const success = await apiQueue.enqueue(() => muteUser(userId))

	if (!success) {
		console.error(`[xBlockOrigin] Failed to mute @${username}`)
		return
	}

	await saveMutedUser({
		username,
		userId,
		country,
		mutedAt: Date.now()
	})

	console.log(
		`[xBlockOrigin] Successfully muted @${username} (${userId}) from ${country}`
	)
	showToast(`Muted @${username} from ${country}`)
}

function getCurrentPage(): string {
	const path = window.location.pathname

	if (path === '/home' || path === '/') {
		return 'timeline'
	}

	if (path.startsWith('/search')) {
		return 'search'
	}

	if (path.startsWith('/notifications')) {
		return 'notifications'
	}

	const systemPages = ['explore', 'messages', 'settings', 'compose', 'i']
	const firstSegment = path.split('/')[1]

	if (firstSegment && !systemPages.includes(firstSegment)) {
		return 'profile'
	}

	return 'unknown'
}

export function startOrchestrator() {
	const cleanupFns: Array<() => void> = []

	const handleUser = (username: string) => {
		processUser(username)
	}

	const currentPage = getCurrentPage()

	switch (currentPage) {
		case 'timeline':
			cleanupFns.push(scanTimeline(handleUser))
			break
		case 'search':
			cleanupFns.push(scanSearch(handleUser))
			break
		case 'notifications':
			cleanupFns.push(scanReplies(handleUser))
			break
		case 'profile':
			cleanupFns.push(scanProfile(handleUser))
			break
	}

	let lastUrl = window.location.href
	const urlWatcher = setInterval(() => {
		if (window.location.href !== lastUrl) {
			lastUrl = window.location.href

			cleanupFns.forEach((fn) => fn())
			cleanupFns.length = 0

			const newPage = getCurrentPage()
			switch (newPage) {
				case 'timeline':
					cleanupFns.push(scanTimeline(handleUser))
					break
				case 'search':
					cleanupFns.push(scanSearch(handleUser))
					break
				case 'notifications':
					cleanupFns.push(scanReplies(handleUser))
					break
				case 'profile':
					cleanupFns.push(scanProfile(handleUser))
					break
			}
		}
	}, 1000)

	return () => {
		clearInterval(urlWatcher)
		cleanupFns.forEach((fn) => fn())
	}
}
