import { getMutedUsers, unmuteUser } from '../Api/unmuteQuery'
import { getAllMutedUsers } from '../Storage/database'

export type UnmuteProgress = {
	total: number | null // null when total is unknown (streaming mode)
	completed: number
	failed: number
	currentUser: string | null
	isRunning: boolean
	isCancelled: boolean
}

export type UnmuteMode = 'all' | 'extension-only'

// unmute users with progress tracking
export async function unmuteUsers(
	mode: UnmuteMode,
	onProgress: (progress: UnmuteProgress) => void,
	getCancelSignal: () => boolean
): Promise<{ succeeded: number; failed: number }> {
	if (mode === 'extension-only') {
		return unmuteExtensionUsers(onProgress, getCancelSignal)
	}
	return unmuteAllUsers(onProgress, getCancelSignal)
}

// unmute only users muted by the extension (from local database)
async function unmuteExtensionUsers(
	onProgress: (progress: UnmuteProgress) => void,
	getCancelSignal: () => boolean
): Promise<{ succeeded: number; failed: number }> {
	const extensionMutedUsers = await getAllMutedUsers()
	const progress: UnmuteProgress = {
		total: extensionMutedUsers.length,
		completed: 0,
		failed: 0,
		currentUser: null,
		isRunning: true,
		isCancelled: false
	}

	onProgress({ ...progress })

	let succeeded = 0
	let failed = 0

	for (const user of extensionMutedUsers) {
		if (getCancelSignal()) {
			progress.isCancelled = true
			progress.isRunning = false
			progress.currentUser = null
			onProgress({ ...progress })
			break
		}

		progress.currentUser = `@${user.username}`
		onProgress({ ...progress })

		const success = await unmuteUser(user.userId)

		if (success) {
			succeeded++
		} else {
			failed++
		}

		progress.completed++
		progress.failed = failed
		onProgress({ ...progress })

		// rate limit: wait 1 second between requests
		if (progress.completed < extensionMutedUsers.length) {
			await new Promise((resolve) => setTimeout(resolve, 1000))
		}
	}

	progress.isRunning = false
	progress.currentUser = null
	onProgress({ ...progress })
	return { succeeded, failed }
}

// unmute ALL muted users (fetch and unmute as we go)
async function unmuteAllUsers(
	onProgress: (progress: UnmuteProgress) => void,
	getCancelSignal: () => boolean
): Promise<{ succeeded: number; failed: number }> {
	const progress: UnmuteProgress = {
		total: null, // unknown until we finish fetching
		completed: 0,
		failed: 0,
		currentUser: null,
		isRunning: true,
		isCancelled: false
	}

	onProgress({ ...progress })

	let succeeded = 0
	let failed = 0
	let cursor: string | undefined = undefined

	do {
		if (getCancelSignal()) {
			progress.isCancelled = true
			progress.isRunning = false
			progress.currentUser = null
			onProgress({ ...progress })
			break
		}

		const { users, nextCursor } = await getMutedUsers(cursor)

		for (const user of users) {
			if (getCancelSignal()) {
				progress.isCancelled = true
				progress.isRunning = false
				progress.currentUser = null
				onProgress({ ...progress })
				return { succeeded, failed }
			}

			progress.currentUser = `@${user.username}`
			onProgress({ ...progress })

			const success = await unmuteUser(user.userId)

			if (success) {
				succeeded++
			} else {
				failed++
			}

			progress.completed++
			progress.failed = failed
			onProgress({ ...progress })

			await new Promise((resolve) => setTimeout(resolve, 1000))
		}

		cursor = nextCursor ?? undefined
	} while (cursor)

	progress.isRunning = false
	progress.currentUser = null
	progress.total = progress.completed // now we know the total
	onProgress({ ...progress })
	return { succeeded, failed }
}
