// per-endpoint rate limit state tracker
class RateLimitState {
	private limits: Map<string, { remaining: number; resetTime: number }> =
		new Map()

	updateFromHeaders(endpoint: string, headers: Headers) {
		const remaining = headers.get('x-rate-limit-remaining')
		const reset = headers.get('x-rate-limit-reset')

		if (remaining && reset) {
			const remainingNum = Number.parseInt(remaining)
			const resetTime = Number.parseInt(reset) * 1000
			this.limits.set(endpoint, {
				remaining: remainingNum,
				resetTime
			})

			if (remainingNum <= 5) {
				const resetDate = new Date(resetTime)
				console.warn(
					`[xBlockOrigin] Rate limit low for ${endpoint}: ${remainingNum} remaining, resets at ${resetDate.toLocaleTimeString()}`
				)
			}
		}
	}

	canMakeRequest(endpoint: string): boolean {
		const limit = this.limits.get(endpoint)

		// if we don't know the limit yet, allow the request
		if (!limit) {
			return true
		}

		// if limit is 0, check if reset time has passed
		if (limit.remaining === 0) {
			if (Date.now() >= limit.resetTime) {
				// reset time has passed, remove stale data
				this.limits.delete(endpoint)
				console.log(`[xBlockOrigin] Rate limit reset for ${endpoint}`)
				return true
			}
			const waitSeconds = Math.ceil((limit.resetTime - Date.now()) / 1000)
			console.warn(
				`[xBlockOrigin] Rate limit hit for ${endpoint}, waiting ${waitSeconds}s until reset`
			)
			return false
		}

		return true
	}

	getRemaining(endpoint: string): number | null {
		return this.limits.get(endpoint)?.remaining ?? null
	}

	getResetTime(endpoint: string): number | null {
		return this.limits.get(endpoint)?.resetTime ?? null
	}
}

export const rateLimitState = new RateLimitState()
