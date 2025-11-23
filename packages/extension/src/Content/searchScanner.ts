import {
	type UsernameCallback,
	extractUsernameFromTweet,
	extractUsernameFromLink
} from './extractors'

// extract username from user cell in search results
function extractUsernameFromUserCell(cellElement: Element): string | null {
	const link = cellElement.querySelector('a[href^="/"][role="link"]')
	return link ? extractUsernameFromLink(link) : null
}

// scan search results for users
export function scanSearch(onUserFound: UsernameCallback): () => void {
	// scan existing user cells and tweets
	const scanExisting = () => {
		// scan user cells (people tab)
		const userCells = document.querySelectorAll('[data-testid="UserCell"]')
		for (const cell of userCells) {
			const username = extractUsernameFromUserCell(cell)
			if (username) {
				onUserFound(username)
			}
		}

		// scan tweets (top/latest tabs)
		const tweets = document.querySelectorAll('[data-testid="tweet"]')
		for (const tweet of tweets) {
			const username = extractUsernameFromTweet(tweet)
			if (username) {
				onUserFound(username)
			}
		}
	}

	scanExisting()

	// watch for new results with mutationobserver
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
