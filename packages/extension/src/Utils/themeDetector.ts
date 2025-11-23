export type XTheme = 'light' | 'dim' | 'lights-out'

export function detectXTheme(): XTheme {
	const backgroundColor = window.getComputedStyle(
		document.body
	).backgroundColor

	const rgbMatch = backgroundColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)

	if (!rgbMatch) {
		return 'dim'
	}

	const [, rStr, gStr, bStr] = rgbMatch
	const r = Number(rStr)
	const g = Number(gStr)
	const b = Number(bStr)

	if (r > 250 && g > 250 && b > 250) {
		return 'light'
	}

	if (r === 0 && g === 0 && b === 0) {
		return 'lights-out'
	}

	return 'dim'
}

export function watchThemeChanges(callback: (theme: XTheme) => void) {
	let currentTheme = detectXTheme()
	callback(currentTheme)

	const observer = new MutationObserver(() => {
		const newTheme = detectXTheme()
		if (newTheme !== currentTheme) {
			currentTheme = newTheme
			callback(newTheme)
		}
	})

	observer.observe(document.body, {
		attributes: true,
		attributeFilter: ['style', 'class']
	})

	return () => observer.disconnect()
}
