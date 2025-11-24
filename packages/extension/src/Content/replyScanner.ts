import { type UsernameCallback, extractUsernameFromLink } from './extractors'

// extract username from notification/mention
function extractUsernameFromNotification(element: Element): string | null {
	const link = element.querySelector('a[href^="/"][role="link"]')
	return link ? extractUsernameFromLink(link) : null
}

// scan notifications/replies for users
export function scanReplies(onUserFound: UsernameCallback): () => void {
	// scan existing notifications
	const scanExisting = () => {
		// notifications use various testids, scan all cells
		const cells = document.querySelectorAll('[data-testid*="cell"]')

		for (const cell of cells) {
			const username = extractUsernameFromNotification(cell)
			if (username) {
				onUserFound(username, cell)
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

			if (username) {
				onUserFound(username, tweet)
			}
		}
	}

	scanExisting()

	// watch for new notifications with mutationobserver
	const observer = new MutationObserver((mutations) => {
		for (const mutation of mutations) {
			for (const node of mutation.addedNodes) {
				if (!(node instanceof Element)) continue

				// check if the added node is a cell
				if (
					node instanceof HTMLElement &&
					node.dataset.testid?.includes('cell')
				) {
					const username = extractUsernameFromNotification(node)
					if (username) {
						onUserFound(username, node)
					}
				}

				// check if the added node is a tweet
				if (
					node instanceof HTMLElement &&
					node.dataset.testid === 'tweet'
				) {
					const userNameElement = node.querySelector(
						'[data-testid="User-Name"]'
					)
					if (userNameElement) {
						const link =
							userNameElement.querySelector('a[href^="/"]')
						if (link) {
							const username = extractUsernameFromLink(link)
							if (username) {
								onUserFound(username, node)
							}
						}
					}
				}

				// check children for cells and tweets
				const cells = node.querySelectorAll('[data-testid*="cell"]')
				for (const cell of cells) {
					const username = extractUsernameFromNotification(cell)
					if (username) {
						onUserFound(username, cell)
					}
				}

				const tweets = node.querySelectorAll('[data-testid="tweet"]')
				for (const tweet of tweets) {
					const userNameElement = tweet.querySelector(
						'[data-testid="User-Name"]'
					)
					if (userNameElement) {
						const link =
							userNameElement.querySelector('a[href^="/"]')
						if (link) {
							const username = extractUsernameFromLink(link)
							if (username) {
								onUserFound(username, tweet)
							}
						}
					}
				}
			}
		}
	})

	observer.observe(document.body, {
		childList: true,
		subtree: true
	})

	// return cleanup function
	return () => observer.disconnect()
}
