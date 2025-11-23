// shared username extraction utilities

export type UsernameCallback = (username: string) => void

// extract username from href path like /username or /username/status/123
function extractUsernameFromHref(href: string): string | null {
	const match = href.match(/^\/([^/]+)/)
	return match?.[1] ?? null
}

// extract username from tweet element
export function extractUsernameFromTweet(tweetElement: Element): string | null {
	const userNameElement = tweetElement.querySelector(
		'[data-testid="User-Name"]'
	)

	if (!userNameElement) {
		return null
	}

	const link = userNameElement.querySelector('a[href^="/"]')
	if (!link) {
		return null
	}

	const href = link.getAttribute('href')
	if (!href) {
		return null
	}

	const match = href.match(/^\/([^/]+)$/)
	return match?.[1] ?? null
}

// extract username from any link element
export function extractUsernameFromLink(link: Element): string | null {
	const href = link.getAttribute('href')
	if (!href) {
		return null
	}

	return extractUsernameFromHref(href)
}
