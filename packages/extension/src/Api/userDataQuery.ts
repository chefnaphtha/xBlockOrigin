import { makeGraphQLRequest } from './client'
import * as v from 'valibot'

// query id for UserByScreenName from HAR analysis
const USER_BY_SCREEN_NAME_QUERY_ID = '-oaLodhGbbnzJBACb1kk2Q'

// combined schema for userId and following status
const userDataResponseSchema = v.object({
	data: v.object({
		user: v.object({
			result: v.object({
				__typename: v.literal('User'),
				rest_id: v.string(),
				relationship_perspectives: v.optional(
					v.object({
						following: v.optional(v.boolean())
					})
				)
			})
		})
	})
})

export type UserData = {
	userId: string
	following: boolean
}

// combined function to get both userId and following status in single API call
export async function getUserData(username: string): Promise<UserData | null> {
	try {
		const response = await makeGraphQLRequest(
			USER_BY_SCREEN_NAME_QUERY_ID,
			'UserByScreenName',
			{
				screen_name: username,
				withSafetyModeUserFields: true
			},
			userDataResponseSchema
		)

		return {
			userId: response.data.user.result.rest_id,
			following:
				response.data.user.result.relationship_perspectives
					?.following ?? false
		}
	} catch (error) {
		return null
	}
}
