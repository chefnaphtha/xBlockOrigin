// x.com uses REST API v1.1 for muting, not GraphQL

// extract csrf token from document.cookie
function getCsrfToken(): string {
	const cookies = document.cookie.split('; ')
	const csrfCookie = cookies.find((c) => c.startsWith('ct0='))

	if (!csrfCookie) {
		throw new Error('CSRF token not found in cookies')
	}

	const token = csrfCookie.split('=')[1]
	if (!token) {
		throw new Error('CSRF token value is empty')
	}

	return token
}

export async function muteUser(userId: string): Promise<boolean> {
	try {
		const csrfToken = getCsrfToken()

		// standard bearer token used by x.com web client
		const bearerToken =
			'AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA'

		const response = await fetch(
			'https://x.com/i/api/1.1/mutes/users/create.json',
			{
				method: 'POST',
				headers: {
					authorization: `Bearer ${bearerToken}`,
					'x-csrf-token': csrfToken,
					'x-twitter-auth-type': 'OAuth2Session',
					'content-type': 'application/x-www-form-urlencoded'
				},
				credentials: 'include',
				body: `user_id=${userId}`
			}
		)

		if (response.status === 429) {
			const resetHeader = response.headers.get('x-rate-limit-reset')
			if (resetHeader) {
				const resetTime = Number.parseInt(resetHeader) * 1000
				const waitTime = resetTime - Date.now()
				const resetDate = new Date(resetTime)
				console.warn(
					`[xBlockOrigin] Rate limited on muteUser, waiting ${Math.ceil(waitTime / 1000)}s until ${resetDate.toLocaleTimeString()}`
				)
				await new Promise((resolve) => setTimeout(resolve, waitTime))
				console.log(
					'[xBlockOrigin] Retrying muteUser after rate limit reset'
				)
				return muteUser(userId)
			}
		}

		if (!response.ok) {
			throw new Error(
				`Mute API failed: ${response.status} ${response.statusText}`
			)
		}

		return true
	} catch (error) {
		return false
	}
}
