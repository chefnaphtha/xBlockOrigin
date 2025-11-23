import {
	unmuteUsers,
	type UnmuteMode,
	type UnmuteProgress
} from '../Utils/unmuteService'

type UnmuteMessage =
	| {
			type: 'START_UNMUTE'
			mode: UnmuteMode
	  }
	| { type: 'CANCEL_UNMUTE' }

type UnmuteResponse =
	| { type: 'UNMUTE_PROGRESS'; progress: UnmuteProgress }
	| { type: 'UNMUTE_COMPLETE'; succeeded: number; failed: number }
	| { type: 'UNMUTE_ERROR'; error: string }

let isCancelled = false

export function setupUnmuteMessageHandler() {
	chrome.runtime.onMessage.addListener(
		(message: UnmuteMessage, _sender, sendResponse) => {
			if (message.type === 'START_UNMUTE') {
				handleStartUnmute(message.mode, sendResponse)
				return true
			}

			if (message.type === 'CANCEL_UNMUTE') {
				isCancelled = true
				return false
			}

			return false
		}
	)
}

async function handleStartUnmute(
	mode: UnmuteMode,
	sendResponse: (response: UnmuteResponse) => void
) {
	try {
		isCancelled = false

		const result = await unmuteUsers(
			mode,
			(progress) => {
				chrome.runtime.sendMessage({
					type: 'UNMUTE_PROGRESS',
					progress
				})
			},
			() => isCancelled
		)

		sendResponse({
			type: 'UNMUTE_COMPLETE',
			succeeded: result.succeeded,
			failed: result.failed
		})
	} catch (error) {
		sendResponse({
			type: 'UNMUTE_ERROR',
			error: error instanceof Error ? error.message : 'Unknown error'
		})
	}
}
