import { detectXTheme } from '../Utils/themeDetector'
import { addToWhitelist } from '../Storage/whitelist'
import { unmuteUser } from '../Api/unmuteQuery'
import { unhidePost, unhideAllPostsByUserId } from './postHider'

function getActualBackgroundColor(): string {
	// get the actual background color from the document body
	const bodyStyles = window.getComputedStyle(document.body)
	const bgColor = bodyStyles.backgroundColor || 'rgb(0, 0, 0)'

	// convert rgb() to rgba() with 50% opacity
	const rgbMatch = bgColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
	if (rgbMatch) {
		return `rgba(${rgbMatch[1]}, ${rgbMatch[2]}, ${rgbMatch[3]}, 0.5)`
	}

	// if already rgba, replace alpha with 0.5
	const rgbaMatch = bgColor.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*[\d.]+\)/)
	if (rgbaMatch) {
		return `rgba(${rgbaMatch[1]}, ${rgbaMatch[2]}, ${rgbaMatch[3]}, 0.5)`
	}

	// fallback
	return 'rgba(0, 0, 0, 0.5)'
}

function getThemeStyles(theme: 'light' | 'dim' | 'lights-out') {
	const themes = {
		light: {
			border: 'rgb(239, 243, 244)',
			text: 'rgb(83, 100, 113)',
			buttonBg: 'rgb(15, 20, 25)',
			buttonText: 'rgb(255, 255, 255)',
			buttonHover: 'rgb(39, 44, 48)'
		},
		dim: {
			border: 'rgb(56, 68, 77)',
			text: 'rgb(139, 152, 165)',
			buttonBg: 'rgb(239, 243, 244)',
			buttonText: 'rgb(15, 20, 25)',
			buttonHover: 'rgb(215, 219, 220)'
		},
		'lights-out': {
			border: 'rgb(47, 51, 54)',
			text: 'rgb(113, 118, 123)',
			buttonBg: 'rgb(239, 243, 244)',
			buttonText: 'rgb(15, 20, 25)',
			buttonHover: 'rgb(215, 219, 220)'
		}
	}

	return themes[theme]
}

export function createHiddenPostNotice(
	userId: string,
	username: string,
	country: string
): Element {
	const theme = detectXTheme()
	const styles = getThemeStyles(theme)
	const bgColor = getActualBackgroundColor()

	const notice = document.createElement('div')
	notice.setAttribute('data-xbo-hidden-user', userId)
	notice.setAttribute('data-testid', 'xbo-hidden-post')

	notice.style.cssText = `
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 12px 16px;
		background: ${bgColor};
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
		border-radius: 12px;
		font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
		gap: 12px;
		z-index: 10;
	`

	const textContainer = document.createElement('div')
	textContainer.style.cssText = `
		flex: 1;
		color: ${styles.text};
		font-size: 15px;
		line-height: 20px;
	`
	textContainer.textContent = `Post by @${username} from ${country} hidden by xBlockOrigin`

	const buttonContainer = document.createElement('div')
	buttonContainer.style.cssText = `
		display: flex;
		gap: 8px;
	`

	const undoButton = document.createElement('button')
	undoButton.textContent = 'Unhide'
	undoButton.style.cssText = `
		padding: 6px 16px;
		background: ${styles.buttonBg};
		color: ${styles.buttonText};
		border: none;
		border-radius: 9999px;
		font-size: 14px;
		font-weight: 700;
		cursor: pointer;
		font-family: inherit;
		transition: background 0.2s;
	`

	undoButton.addEventListener('mouseenter', () => {
		undoButton.style.background = styles.buttonHover
	})

	undoButton.addEventListener('mouseleave', () => {
		undoButton.style.background = styles.buttonBg
	})

	undoButton.addEventListener('click', () => {
		unhidePost(notice, userId, username)
	})

	const whitelistButton = document.createElement('button')
	whitelistButton.textContent = 'Unmute and whitelist'
	whitelistButton.style.cssText = `
		padding: 6px 16px;
		background: transparent;
		color: ${styles.text};
		border: 1px solid ${styles.border};
		border-radius: 9999px;
		font-size: 14px;
		font-weight: 700;
		cursor: pointer;
		font-family: inherit;
		transition: background 0.2s;
	`

	whitelistButton.addEventListener('mouseenter', () => {
		whitelistButton.style.opacity = '0.7'
	})

	whitelistButton.addEventListener('mouseleave', () => {
		whitelistButton.style.opacity = '1'
	})

	whitelistButton.addEventListener('click', async () => {
		// unmute the user via X.com API
		await unmuteUser(userId)

		// add to whitelist
		await addToWhitelist(userId, username)

		// unhide all posts by this user
		unhideAllPostsByUserId(userId)

		// notify other parts of the extension
		chrome.runtime.sendMessage({
			type: 'USER_WHITELISTED',
			userId,
			username
		})
	})

	buttonContainer.appendChild(undoButton)
	buttonContainer.appendChild(whitelistButton)

	notice.appendChild(textContainer)
	notice.appendChild(buttonContainer)

	return notice
}

export function createUnhiddenNotice(
	userId: string,
	username: string
): Element {
	const theme = detectXTheme()
	const styles = getThemeStyles(theme)

	const notice = document.createElement('div')
	notice.setAttribute('data-xbo-unhidden-notice', userId)
	notice.style.cssText = `
		padding: 12px 16px;
		margin-top: 8px;
		background: ${styles.border};
		border-radius: 12px;
		font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
	`

	const textContainer = document.createElement('div')
	textContainer.style.cssText = `
		flex: 1;
		color: ${styles.text};
		font-size: 14px;
		line-height: 20px;
	`
	textContainer.textContent = 'Post unhidden, but user is still muted.'

	const buttonContainer = document.createElement('div')
	buttonContainer.style.cssText = `
		display: flex;
		gap: 8px;
		align-items: center;
	`

	const unmuteButton = document.createElement('button')
	unmuteButton.textContent = 'Unmute and whitelist'
	unmuteButton.style.cssText = `
		padding: 6px 16px;
		background: ${styles.buttonBg};
		color: ${styles.buttonText};
		border: none;
		border-radius: 9999px;
		font-size: 14px;
		font-weight: 700;
		cursor: pointer;
		font-family: inherit;
		transition: background 0.2s;
	`

	unmuteButton.addEventListener('mouseenter', () => {
		unmuteButton.style.background = styles.buttonHover
	})

	unmuteButton.addEventListener('mouseleave', () => {
		unmuteButton.style.background = styles.buttonBg
	})

	unmuteButton.addEventListener('click', async () => {
		// unmute the user via X.com API
		await unmuteUser(userId)

		// add to whitelist
		await addToWhitelist(userId, username)

		// unhide all posts by this user
		unhideAllPostsByUserId(userId)

		// notify other parts of the extension
		chrome.runtime.sendMessage({
			type: 'USER_WHITELISTED',
			userId,
			username
		})

		// remove the notice
		notice.remove()
	})

	const closeButton = document.createElement('button')
	closeButton.textContent = '×'
	closeButton.setAttribute('aria-label', 'Close')
	closeButton.style.cssText = `
		background: transparent;
		border: none;
		color: ${styles.text};
		font-size: 24px;
		line-height: 1;
		cursor: pointer;
		padding: 0;
		width: 24px;
		height: 24px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-family: inherit;
	`

	closeButton.addEventListener('mouseenter', () => {
		closeButton.style.opacity = '0.7'
	})

	closeButton.addEventListener('mouseleave', () => {
		closeButton.style.opacity = '1'
	})

	closeButton.addEventListener('click', () => {
		notice.remove()
	})

	buttonContainer.appendChild(unmuteButton)
	buttonContainer.appendChild(closeButton)

	notice.appendChild(textContainer)
	notice.appendChild(buttonContainer)

	return notice
}
