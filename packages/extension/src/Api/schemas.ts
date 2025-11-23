import * as v from 'valibot'

// AboutAccountQuery response schema
export const aboutProfileSchema = v.object({
	account_based_in: v.string(),
	location_accurate: v.boolean(),
	learn_more_url: v.pipe(v.string(), v.url()),
	source: v.string(),
	username_changes: v.object({
		count: v.string(),
		last_changed_at_msec: v.optional(v.string())
	})
})

export const aboutAccountQueryResponseSchema = v.object({
	data: v.object({
		user_result_by_screen_name: v.object({
			result: v.object({
				about_profile: v.optional(aboutProfileSchema)
			})
		})
	})
})

// UserByScreenName response schema
export const userResultSchema = v.object({
	__typename: v.literal('User'),
	rest_id: v.string()
})

export const userByScreenNameResponseSchema = v.object({
	data: v.object({
		user: v.object({
			result: userResultSchema
		})
	})
})

// MutedAccounts GraphQL response schema
export const mutedUserEntrySchema = v.object({
	entryId: v.string(),
	sortIndex: v.string(),
	content: v.object({
		entryType: v.string(),
		itemContent: v.optional(
			v.object({
				itemType: v.string(),
				user_results: v.object({
					result: v.object({
						rest_id: v.string(),
						core: v.optional(
							v.object({
								screen_name: v.optional(v.string()),
								name: v.optional(v.string())
							})
						),
						relationship_perspectives: v.optional(
							v.object({
								muting: v.boolean()
							})
						)
					})
				})
			})
		),
		value: v.optional(v.string()), // for cursor entries
		cursorType: v.optional(v.string())
	})
})

export const mutedAccountsResponseSchema = v.object({
	data: v.object({
		viewer: v.object({
			muting_timeline: v.object({
				timeline: v.object({
					instructions: v.array(
						v.object({
							type: v.string(),
							entries: v.optional(v.array(mutedUserEntrySchema))
						})
					)
				})
			})
		})
	})
})

// Type exports
export type AboutProfile = v.InferOutput<typeof aboutProfileSchema>
export type AboutAccountQueryResponse = v.InferOutput<
	typeof aboutAccountQueryResponseSchema
>
export type UserResult = v.InferOutput<typeof userResultSchema>
export type UserByScreenNameResponse = v.InferOutput<
	typeof userByScreenNameResponseSchema
>
export type MutedUserEntry = v.InferOutput<typeof mutedUserEntrySchema>
export type MutedAccountsResponse = v.InferOutput<
	typeof mutedAccountsResponseSchema
>
