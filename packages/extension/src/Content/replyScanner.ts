import { type UsernameCallback, extractUsernameFromLink } from './extractors'

// extract username from notification/mention
function extractUsernameFromNotification(element: Element): string | null {
	const link = element.querySelector('a[href^="/"][role="link"]')
	return link ? extractUsernameFromLink(link) : null
}

// scan notifications/replies for users
export function scanReplies(onUserFound: UsernameCallback): () => void {
	const seenUsernames = new Set<string>()

	// scan existing notifications
	const scanExisting = () => {
		// notifications use various testids, scan all cells
		const cells = document.querySelectorAll('[data-testid*="cell"]')

		for (const cell of cells) {
			const username = extractUsernameFromNotification(cell)
			if (username && !seenUsernames.has(username)) {
				seenUsernames.add(username)
				onUserFound(username)
			}
		}

		// also scan tweets in notifications tab
		const tweets = document.querySelectorAll('[data-testid="tweet"]')
		for (const tweet of tweets) {
			const userNameElement = tweet.querySelector(
				'[data-testid="User-Name"]'
			)
			if (!userNameElement) continue

			const link = userNameElement.querySelector('a[href^="/"]')
			if (!link) continue

			const username = extractUsernameFromLink(link)

			if (username && !seenUsernames.has(username)) {
				seenUsernames.add(username)
				onUserFound(username)
			}
		}
	}

	scanExisting()

	// watch for new notifications with mutationobserver
	const observer = new MutationObserver(() => {
		scanExisting()
	})

	observer.observe(document.body, {
		childList: true,
		subtree: true
	})

	// return cleanup function
	return () => observer.disconnect()
}
