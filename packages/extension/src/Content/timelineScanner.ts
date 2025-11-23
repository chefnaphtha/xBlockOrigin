import { type UsernameCallback, extractUsernameFromTweet } from './extractors'

// scan timeline for tweets and call callback with found usernames
export function scanTimeline(onUserFound: UsernameCallback): () => void {
	// scan existing tweets
	const existingTweets = document.querySelectorAll('[data-testid="tweet"]')
	for (const tweet of existingTweets) {
		const username = extractUsernameFromTweet(tweet)
		if (username) {
			onUserFound(username)
		}
	}

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
						onUserFound(username)
					}
				}

				// check children for tweets
				const tweets = node.querySelectorAll('[data-testid="tweet"]')
				for (const tweet of tweets) {
					const username = extractUsernameFromTweet(tweet)
					if (username) {
						onUserFound(username)
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
