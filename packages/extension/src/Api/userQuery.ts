import { makeGraphQLRequest } from './client'
import { userByScreenNameResponseSchema } from './schemas'

// query id for UserByScreenName from HAR analysis
const USER_BY_SCREEN_NAME_QUERY_ID = '-oaLodhGbbnzJBACb1kk2Q'

export async function getUserId(screenName: string): Promise<string | null> {
	try {
		const response = await makeGraphQLRequest(
			USER_BY_SCREEN_NAME_QUERY_ID,
			'UserByScreenName',
			{
				screen_name: screenName,
				withSafetyModeUserFields: true
			},
			userByScreenNameResponseSchema
		)

		return response.data.user.result.rest_id
	} catch (error) {
		return null
	}
}
