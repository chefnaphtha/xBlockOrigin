import { makeGraphQLRequest } from './client'
import { aboutAccountQueryResponseSchema } from './schemas'

// query id for AboutAccountQuery from HAR analysis
const ABOUT_ACCOUNT_QUERY_ID = 'XRqGa7EeokUU5kppkh13EA'

export async function getCountry(screenName: string): Promise<string | null> {
	try {
		const response = await makeGraphQLRequest(
			ABOUT_ACCOUNT_QUERY_ID,
			'AboutAccountQuery',
			{ screenName },
			aboutAccountQueryResponseSchema
		)

		const aboutProfile =
			response.data.user_result_by_screen_name.result.about_profile

		if (!aboutProfile) {
			return null
		}

		return aboutProfile.account_based_in
	} catch (error) {
		return null
	}
}
