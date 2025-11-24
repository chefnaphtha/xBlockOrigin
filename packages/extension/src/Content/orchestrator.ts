import { getCountry } from '../Api/countryQuery'
import { muteUser } from '../Api/muteQuery'
import { getUserData } from '../Api/userDataQuery'
import { isUserMuted, saveMutedUser } from '../Storage/database'
import { getMuteFollowing } from '../Storage/settings'
import { isWhitelisted } from '../Storage/whitelist'
import { countryCache, followingCache, userIdCache } from '../Utils/cache'
import { apiQueue } from '../Utils/rateLimit'
import { injectCountryFlag } from './flagInjector'
import { hidePost } from './postHider'
import { scanProfile } from './profileScanner'
import { scanReplies } from './replyScanner'
import { scanSearch } from './searchScanner'
import { scanStatus } from './statusScanner'
import { scanTimeline } from './timelineScanner'

// track users currently being processed to prevent race conditions
const inFlightUsers = new Set<string>()

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

async function processUser(username: string, tweetElement?: Element) {
	// skip if already processing this user
	if (inFlightUsers.has(username)) {
		console.log(`[xBlockOrigin] Skipping @${username} - already processing`)
		return
	}
	inFlightUsers.add(username)

	console.log(`[xBlockOrigin] Processing user @${username}`)

	const { getShowFlags } = await import('../Storage/settings')
	const showFlags = await getShowFlags()

	// get userId and following status - check cache first
	let userId = await userIdCache.get(username)
	let following = false

	if (!userId) {
		console.log(
			`[xBlockOrigin] Fetching user data for @${username} (cache miss)`
		)
		const userData = await apiQueue.enqueue(() => getUserData(username))

		if (!userData) {
			console.error(
				`[xBlockOrigin] Failed to get user data for @${username}`
			)
			inFlightUsers.delete(username)
			return
		}

		userId = userData.userId
		following = userData.following

		console.log(
			`[xBlockOrigin] Got user data for @${username}: ${userId}, following: ${following}`
		)
		await userIdCache.set(username, userId)
		await followingCache.set(userId, following)
	} else {
		console.log(
			`[xBlockOrigin] User ID for @${username} from cache: ${userId}`
		)

		// check following cache
		const cachedFollowing = await followingCache.get(userId)
		if (cachedFollowing !== null) {
			following = cachedFollowing
			console.log(
				`[xBlockOrigin] Following status for @${username} from cache: ${following}`
			)
		} else {
			// userId cached but following status not - fetch user data to update
			console.log(
				`[xBlockOrigin] Following status cache miss for @${username}, fetching user data`
			)
			const userData = await apiQueue.enqueue(() => getUserData(username))

			if (!userData) {
				console.error(
					`[xBlockOrigin] Failed to get user data for @${username}`
				)
				inFlightUsers.delete(username)
				return
			}

			following = userData.following
			await followingCache.set(userId, following)
			console.log(
				`[xBlockOrigin] Updated following status for @${username}: ${following}`
			)
		}
	}

	// check if whitelisted - skip all processing if true
	const whitelisted = await isWhitelisted(userId)
	if (whitelisted) {
		inFlightUsers.delete(username)
		return
	}

	// check if we should skip users we follow
	const muteFollowing = await getMuteFollowing()
	if (!muteFollowing && following) {
		console.log(
			`[xBlockOrigin] Skipping @${username} - you are following this user`
		)
		inFlightUsers.delete(username)
		return
	}

	// check cache first for country
	let country = await countryCache.get(username)
	let needsApiMute = false

	if (!country) {
		// check if this userId is already muted
		const alreadyMuted = await isUserMuted(userId)
		if (alreadyMuted) {
			inFlightUsers.delete(username)
			return
		}

		// fetch country for new users
		console.log(`[xBlockOrigin] Fetching country for @${username}`)
		country = await apiQueue.enqueue(() => getCountry(username))

		if (!country) {
			console.log(
				`[xBlockOrigin] Could not fetch country for @${username}`
			)
			inFlightUsers.delete(username)
			return
		}

		console.log(`[xBlockOrigin] @${username} is from ${country}`)
		await countryCache.set(username, country)
		needsApiMute = true
	} else {
		console.log(
			`[xBlockOrigin] Country for @${username} from cache: ${country}`
		)
	}

	// inject flag if enabled
	if (showFlags) {
		injectCountryFlag(username, country)
	}

	// check if country is blacklisted
	const blacklist = await getBlacklist()
	const isBlacklisted = blacklist.some(
		(c) => c.toLowerCase() === country.toLowerCase()
	)

	if (!isBlacklisted) {
		inFlightUsers.delete(username)
		return
	}

	// hide post immediately if element is provided
	if (tweetElement) {
		hidePost(tweetElement, userId, username, country)
	}

	// only mute via API if this is a newly discovered blacklisted user
	if (needsApiMute) {
		console.log(
			`[xBlockOrigin] Attempting to mute @${username} (${userId}) from ${country}...`
		)
		const success = await apiQueue.enqueue(() => muteUser(userId))

		if (!success) {
			console.error(`[xBlockOrigin] Failed to mute @${username}`)
			inFlightUsers.delete(username)
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

	// processing complete, remove from in-flight tracker
	inFlightUsers.delete(username)
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

	// check if this is a status page (post detail with replies)
	// format: /{username}/status/{id}
	if (path.includes('/status/')) {
		return 'status'
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

	const handleUser = (username: string, tweetElement?: Element) => {
		processUser(username, tweetElement)
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
		case 'status':
			cleanupFns.push(scanStatus(handleUser))
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
				case 'status':
					cleanupFns.push(scanStatus(handleUser))
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
