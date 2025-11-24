import { type UsernameCallback, extractUsernameFromTweet } from './extractors'

// scan post detail page (status page) for tweets/replies
export function scanStatus(onUserFound: UsernameCallback): () => void {
	// scan existing tweets
	const scanExisting = () => {
		const tweets = document.querySelectorAll('[data-testid="tweet"]')
		for (const tweet of tweets) {
			const username = extractUsernameFromTweet(tweet)
			if (username) {
				onUserFound(username, tweet)
			}
		}
	}

	scanExisting()

	// watch for new tweets with mutationobserver
	const observer = new MutationObserver((mutations) => {
		for (const mutation of mutations) {
			for (const node of mutation.addedNodes) {
				if (!(node instanceof Element)) continue

				// check if the added node is a tweet
				if (
					node instanceof HTMLElement &&
					node.dataset.testid === 'tweet'
				) {
					const username = extractUsernameFromTweet(node)
					if (username) {
						onUserFound(username, node)
					}
				}

				// check children for tweets
				const tweets = node.querySelectorAll('[data-testid="tweet"]')
				for (const tweet of tweets) {
					const username = extractUsernameFromTweet(tweet)
					if (username) {
						onUserFound(username, tweet)
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
