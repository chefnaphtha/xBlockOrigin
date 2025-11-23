import { getCountryFlag } from '../Utils/countryFlags'

const BADGE_ID_PREFIX = 'xblock-country-badge-'

// inject country flag badge into all tweets by this username
export function injectCountryFlag(username: string, country: string) {
	const flag = getCountryFlag(country)
	const badgeId = `${BADGE_ID_PREFIX}${username}`

	// find all tweets from this user
	const tweets = document.querySelectorAll('[data-testid="tweet"]')

	for (const tweet of tweets) {
		// check if this tweet is from the target user
		const userNameElement = tweet.querySelector('[data-testid="User-Name"]')
		if (!userNameElement) continue

		const link = userNameElement.querySelector('a[href^="/"]')
		if (!link) continue

		const href = link.getAttribute('href')
		if (!href) continue

		const match = href.match(/^\/([^/]+)$/)
		const tweetUsername = match?.[1]

		if (tweetUsername !== username) continue

		// check if badge already exists
		if (tweet.querySelector(`#${badgeId}`)) continue

		// create badge
		const badge = document.createElement('span')
		badge.id = badgeId
		badge.textContent = `${flag} ${country}`
		badge.style.cssText = `
			display: inline-flex;
			align-items: center;
			gap: 4px;
			margin-left: 4px;
			padding: 2px 6px;
			background: rgba(29, 155, 240, 0.1);
			border: 1px solid rgba(29, 155, 240, 0.2);
			border-radius: 4px;
			font-size: 12px;
			color: rgb(29, 155, 240);
			font-weight: 400;
			font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
		`

		// insert badge after username in the User-Name container
		userNameElement.appendChild(badge)
	}
}

// remove all country flag badges
export function removeAllFlags() {
	const badges = document.querySelectorAll(`[id^="${BADGE_ID_PREFIX}"]`)
	for (const badge of badges) {
		badge.remove()
	}
}
