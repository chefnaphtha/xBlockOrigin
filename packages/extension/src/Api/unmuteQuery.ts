import * as v from 'valibot'
import { mutedAccountsResponseSchema } from './schemas'

// query id for MutedAccounts from HAR analysis
const MUTED_ACCOUNTS_QUERY_ID = '5a30tCbggzoTACV_yr-cRA'

export type MutedUserInfo = {
	userId: string
	username: string
	displayName: string
}

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

// get paginated list of muted users
export async function getMutedUsers(
	cursor?: string
): Promise<{ users: MutedUserInfo[]; nextCursor: string | null }> {
	const variables: Record<string, unknown> = {
		count: 20,
		includePromotedContent: false
	}

	if (cursor) {
		variables.cursor = cursor
	}

	// add all required features from HAR
	const features = {
		rweb_video_screen_enabled: false,
		profile_label_improvements_pcf_label_in_post_enabled: true,
		responsive_web_profile_redirect_enabled: false,
		rweb_tipjar_consumption_enabled: true,
		verified_phone_label_enabled: false,
		creator_subscriptions_tweet_preview_api_enabled: true,
		responsive_web_graphql_timeline_navigation_enabled: true,
		responsive_web_graphql_skip_user_profile_image_extensions_enabled: false,
		premium_content_api_read_enabled: false,
		communities_web_enable_tweet_community_results_fetch: true,
		c9s_tweet_anatomy_moderator_badge_enabled: true,
		responsive_web_grok_analyze_button_fetch_trends_enabled: false,
		responsive_web_grok_analyze_post_followups_enabled: true,
		responsive_web_jetfuel_frame: true,
		responsive_web_grok_share_attachment_enabled: true,
		articles_preview_enabled: true,
		responsive_web_edit_tweet_api_enabled: true,
		graphql_is_translatable_rweb_tweet_is_translatable_enabled: true,
		view_counts_everywhere_api_enabled: true,
		longform_notetweets_consumption_enabled: true,
		responsive_web_twitter_article_tweet_consumption_enabled: true,
		tweet_awards_web_tipping_enabled: false,
		responsive_web_grok_show_grok_translated_post: false,
		responsive_web_grok_analysis_button_from_backend: true,
		creator_subscriptions_quote_tweet_preview_enabled: false,
		freedom_of_speech_not_reach_fetch_enabled: true,
		standardized_nudges_misinfo: true,
		tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled: true,
		longform_notetweets_rich_text_read_enabled: true,
		longform_notetweets_inline_media_enabled: true,
		responsive_web_grok_image_annotation_enabled: true,
		responsive_web_grok_imagine_annotation_enabled: true,
		responsive_web_grok_community_note_auto_translation_is_enabled: false,
		responsive_web_enhance_cards_enabled: false
	}

	// manually construct the URL since we need custom features
	const csrfToken = getCsrfToken()
	const bearerToken =
		'AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA'

	const url = new URL(
		`https://x.com/i/api/graphql/${MUTED_ACCOUNTS_QUERY_ID}/MutedAccounts`
	)
	url.searchParams.set('variables', JSON.stringify(variables))
	url.searchParams.set('features', JSON.stringify(features))

	const response = await fetch(url.toString(), {
		method: 'GET',
		headers: {
			authorization: `Bearer ${bearerToken}`,
			'x-csrf-token': csrfToken,
			'x-twitter-auth-type': 'OAuth2Session',
			'content-type': 'application/json'
		},
		credentials: 'include'
	})

	// handle rate limiting
	if (response.status === 429) {
		const resetHeader = response.headers.get('x-rate-limit-reset')
		if (resetHeader) {
			const resetTime = Number.parseInt(resetHeader) * 1000
			const waitTime = resetTime - Date.now()
			const resetDate = new Date(resetTime)
			console.warn(
				`[xBlockOrigin] Rate limited on getMutedUsers, waiting ${Math.ceil(waitTime / 1000)}s until ${resetDate.toLocaleTimeString()}`
			)
			await new Promise((resolve) => setTimeout(resolve, waitTime))
			console.log(
				'[xBlockOrigin] Retrying getMutedUsers after rate limit reset'
			)
			return getMutedUsers(cursor)
		}
	}

	if (!response.ok) {
		throw new Error(
			`Failed to fetch muted users: ${response.status} ${response.statusText}`
		)
	}

	const data = await response.json()
	const validated = v.parse(mutedAccountsResponseSchema, data)

	const users: MutedUserInfo[] = []
	let nextCursor: string | null = null

	const instructions =
		validated.data.viewer.muting_timeline.timeline.instructions

	for (const instruction of instructions) {
		if (instruction.entries) {
			for (const entry of instruction.entries) {
				// check if this is a user entry
				if (entry.content.itemContent?.user_results) {
					const result = entry.content.itemContent.user_results.result
					users.push({
						userId: result.rest_id,
						username: result.core?.screen_name ?? 'unknown',
						displayName: result.core?.name ?? 'Unknown'
					})
				}

				// check if this is a cursor entry
				if (
					entry.content.cursorType === 'Bottom' &&
					entry.content.value
				) {
					nextCursor = entry.content.value
				}
			}
		}
	}
	return { users, nextCursor }
}

// unmute a user by userId
export async function unmuteUser(userId: string): Promise<boolean> {
	try {
		const csrfToken = getCsrfToken()
		const bearerToken =
			'AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA'

		const response = await fetch(
			'https://x.com/i/api/1.1/mutes/users/destroy.json',
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

		// handle rate limiting
		if (response.status === 429) {
			const resetHeader = response.headers.get('x-rate-limit-reset')
			if (resetHeader) {
				const resetTime = Number.parseInt(resetHeader) * 1000
				const waitTime = resetTime - Date.now()
				const resetDate = new Date(resetTime)
				console.warn(
					`[xBlockOrigin] Rate limited on unmuteUser, waiting ${Math.ceil(waitTime / 1000)}s until ${resetDate.toLocaleTimeString()}`
				)
				await new Promise((resolve) => setTimeout(resolve, waitTime))
				console.log(
					'[xBlockOrigin] Retrying unmuteUser after rate limit reset'
				)
				return unmuteUser(userId)
			}
		}

		if (!response.ok) {
			throw new Error(
				`Failed to unmute user: ${response.status} ${response.statusText}`
			)
		}

		return true
	} catch (error) {
		return false
	}
}
