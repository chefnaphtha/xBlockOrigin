import {
	createHiddenPostNotice,
	createUnhiddenNotice
} from './hiddenPostNotice'

// store mapping from notice elements to tweet elements
const noticeToTweet = new WeakMap<Element, Element>()

// map to track hidden posts by userId for bulk operations
const hiddenByUserId = new Map<string, Set<Element>>()

export function hidePost(
	tweetElement: Element,
	userId: string,
	username: string,
	country: string
): void {
	// skip if already hidden
	if (tweetElement.querySelector('[data-testid="xbo-hidden-post"]')) {
		return
	}

	// ensure tweet element has relative positioning for overlay
	if (tweetElement instanceof HTMLElement) {
		const currentPosition = window.getComputedStyle(tweetElement).position
		if (currentPosition === 'static') {
			tweetElement.style.position = 'relative'
		}
	}

	// create notice overlay
	const notice = createHiddenPostNotice(userId, username, country)
	noticeToTweet.set(notice, tweetElement)

	// track by userId
	if (!hiddenByUserId.has(userId)) {
		hiddenByUserId.set(userId, new Set())
	}
	hiddenByUserId.get(userId)?.add(notice)

	// append overlay to tweet element
	tweetElement.appendChild(notice)
}

export function unhidePost(
	noticeElement: Element,
	userId: string,
	username: string
): void {
	// get the tweet element that contains this notice
	const tweetElement = noticeElement.parentElement

	// remove the overlay element
	if (tweetElement) {
		noticeElement.remove()

		// create and insert the unhidden notice after the tweet
		const unhiddenNotice = createUnhiddenNotice(userId, username)

		// check if there's already an unhidden notice
		const existingNotice = tweetElement.nextElementSibling
		if (
			existingNotice &&
			existingNotice.getAttribute('data-xbo-unhidden-notice') === userId
		) {
			// replace existing notice
			existingNotice.replaceWith(unhiddenNotice)
		} else {
			// insert after tweet element
			tweetElement.after(unhiddenNotice)
		}
	}

	// cleanup tracking
	const userSet = hiddenByUserId.get(userId)
	if (userSet) {
		userSet.delete(noticeElement)
		if (userSet.size === 0) {
			hiddenByUserId.delete(userId)
		}
	}

	noticeToTweet.delete(noticeElement)
}

export function findAllPostsByUserId(userId: string): Element[] {
	const elements = hiddenByUserId.get(userId)
	return elements ? Array.from(elements) : []
}

export function unhideAllPostsByUserId(userId: string): void {
	const noticeElements = findAllPostsByUserId(userId)

	for (const notice of noticeElements) {
		if (document.contains(notice)) {
			notice.remove()
			noticeToTweet.delete(notice)
		}
	}

	hiddenByUserId.delete(userId)
}
