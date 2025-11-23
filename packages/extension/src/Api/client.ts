import * as v from 'valibot'
import { rateLimitState } from '../Utils/rateLimitState'

type GraphQLVariables = Record<string, unknown>

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

// extract auth tokens from cookies and page headers
function getAuthHeaders(): {
	authorization: string
	'x-csrf-token': string
	'x-twitter-auth-type': string
} {
	// get csrf token from document.cookie
	const csrfToken = getCsrfToken()

	// standard bearer token used by x.com web client
	const bearerToken =
		'AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA'

	return {
		authorization: `Bearer ${bearerToken}`,
		'x-csrf-token': csrfToken,
		'x-twitter-auth-type': 'OAuth2Session'
	}
}

// make a graphql request to x.com (GET with variables in URL)
export async function makeGraphQLRequest<
	T extends v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>
>(
	queryId: string,
	operationName: string,
	variables: GraphQLVariables,
	schema: T
): Promise<v.InferOutput<T>> {
	const endpoint = `${queryId}/${operationName}`
	if (!rateLimitState.canMakeRequest(endpoint)) {
		const resetTime = rateLimitState.getResetTime(endpoint)
		if (resetTime) {
			const waitTime = resetTime - Date.now()
			await new Promise((resolve) => setTimeout(resolve, waitTime))
		}
	}

	const authHeaders = getAuthHeaders()

	const url = new URL(
		`https://x.com/i/api/graphql/${queryId}/${operationName}`
	)
	url.searchParams.set('variables', JSON.stringify(variables))

	// exact features from HAR file (UserByScreenName query)
	const features = {
		creator_subscriptions_tweet_preview_api_enabled: true,
		hidden_profile_subscriptions_enabled: true,
		highlights_tweets_tab_ui_enabled: true,
		profile_label_improvements_pcf_label_in_post_enabled: true,
		responsive_web_graphql_skip_user_profile_image_extensions_enabled: false,
		responsive_web_graphql_timeline_navigation_enabled: true,
		responsive_web_profile_redirect_enabled: false,
		responsive_web_twitter_article_notes_tab_enabled: true,
		rweb_tipjar_consumption_enabled: true,
		subscriptions_feature_can_gift_premium: true,
		subscriptions_verification_info_is_identity_verified_enabled: true,
		subscriptions_verification_info_verified_since_enabled: true,
		verified_phone_label_enabled: false
	}

	url.searchParams.set('features', JSON.stringify(features))

	const response = await fetch(url.toString(), {
		method: 'GET',
		headers: {
			...authHeaders,
			'content-type': 'application/json'
		},
		credentials: 'include'
	})

	if (response.status === 429) {
		const resetHeader = response.headers.get('x-rate-limit-reset')
		if (resetHeader) {
			const resetTime = Number.parseInt(resetHeader) * 1000
			const waitTime = resetTime - Date.now()
			const resetDate = new Date(resetTime)
			console.warn(
				`[xBlockOrigin] Rate limited on ${operationName}, waiting ${Math.ceil(waitTime / 1000)}s until ${resetDate.toLocaleTimeString()}`
			)
			await new Promise((resolve) => setTimeout(resolve, waitTime))
			console.log(
				`[xBlockOrigin] Retrying ${operationName} after rate limit reset`
			)
			return makeGraphQLRequest(queryId, operationName, variables, schema)
		}
	}

	if (!response.ok) {
		throw new Error(
			`GraphQL request failed: ${response.status} ${response.statusText}`
		)
	}

	rateLimitState.updateFromHeaders(endpoint, response.headers)

	const data = await response.json()
	return v.parse(schema, data)
}

// make a graphql mutation to x.com (POST with variables in body)
export async function makeGraphQLMutation<
	T extends v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>
>(
	queryId: string,
	operationName: string,
	variables: GraphQLVariables,
	schema: T
): Promise<v.InferOutput<T>> {
	const endpoint = `${queryId}/${operationName}`
	if (!rateLimitState.canMakeRequest(endpoint)) {
		const resetTime = rateLimitState.getResetTime(endpoint)
		if (resetTime) {
			const waitTime = resetTime - Date.now()
			await new Promise((resolve) => setTimeout(resolve, waitTime))
		}
	}

	const authHeaders = getAuthHeaders()

	const response = await fetch(
		`https://x.com/i/api/graphql/${queryId}/${operationName}`,
		{
			method: 'POST',
			headers: {
				...authHeaders,
				'content-type': 'application/json'
			},
			credentials: 'include',
			body: JSON.stringify({
				variables,
				queryId
			})
		}
	)

	if (response.status === 429) {
		const resetHeader = response.headers.get('x-rate-limit-reset')
		if (resetHeader) {
			const resetTime = Number.parseInt(resetHeader) * 1000
			const waitTime = resetTime - Date.now()
			const resetDate = new Date(resetTime)
			console.warn(
				`[xBlockOrigin] Rate limited on ${operationName}, waiting ${Math.ceil(waitTime / 1000)}s until ${resetDate.toLocaleTimeString()}`
			)
			await new Promise((resolve) => setTimeout(resolve, waitTime))
			console.log(
				`[xBlockOrigin] Retrying ${operationName} after rate limit reset`
			)
			return makeGraphQLMutation(
				queryId,
				operationName,
				variables,
				schema
			)
		}
	}

	if (!response.ok) {
		throw new Error(
			`GraphQL mutation failed: ${response.status} ${response.statusText}`
		)
	}

	rateLimitState.updateFromHeaders(endpoint, response.headers)

	const data = await response.json()
	return v.parse(schema, data)
}
