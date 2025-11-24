type QueuedTask = {
	fn: () => Promise<unknown>
	resolve: (value: unknown) => void
	reject: (error: unknown) => void
	addedAt: number
	key?: string
}

const MAX_AGE_MS = 60 * 1000 // 1 minute
const MAX_QUEUE_SIZE = 10

export function createQueue() {
	const queue: QueuedTask[] = []
	let isProcessing = false

	async function processQueue() {
		if (isProcessing || queue.length === 0) {
			return
		}

		isProcessing = true

		while (queue.length > 0) {
			const task = queue.pop()
			if (!task) break

			// skip tasks older than 1 minute
			const age = Date.now() - task.addedAt
			if (age > MAX_AGE_MS) {
				console.warn(
					`[xBlockOrigin] Skipping stale API request (age: ${Math.round(age / 1000)}s)`
				)
				task.reject(
					new Error(
						`Request timed out after ${MAX_AGE_MS}ms in queue`
					)
				)
				continue
			}

			try {
				const result = await task.fn()
				task.resolve(result)
			} catch (error) {
				task.reject(error)
			}
		}

		isProcessing = false
	}

	return {
		enqueue<T>(fn: () => Promise<T>, key?: string): Promise<T> {
			return new Promise<T>((resolve, reject) => {
				// if key is provided, check if task already exists and remove it
				if (key) {
					const existingIndex = queue.findIndex(
						(task) => task.key === key
					)
					if (existingIndex !== -1) {
						const removed = queue.splice(existingIndex, 1)[0]
						if (removed) {
							console.log(
								`[xBlockOrigin] Bumping priority for ${key} (was at position ${existingIndex})`
							)
							removed.reject(
								new Error('Task re-queued with higher priority')
							)
						}
					}
				}

				// remove oldest item if queue is full
				if (queue.length >= MAX_QUEUE_SIZE) {
					const removed = queue.shift()
					if (removed) {
						console.warn(
							`[xBlockOrigin] Queue full, dropping oldest request (age: ${Math.round((Date.now() - removed.addedAt) / 1000)}s)`
						)
						removed.reject(new Error('Queue full, request dropped'))
					}
				}

				const task: QueuedTask = {
					fn,
					resolve: (value) => resolve(value as T),
					reject,
					addedAt: Date.now()
				}
				if (key) {
					task.key = key
				}
				queue.push(task)
				processQueue()
			})
		},

		getQueueLength(): number {
			return queue.length
		},

		clear(): void {
			const count = queue.length
			if (count > 0) {
				console.log(
					`[xBlockOrigin] Clearing ${count} pending API requests from queue`
				)
				// reject all pending tasks
				for (const task of queue) {
					task.reject(new Error('Queue cleared due to navigation'))
				}
				queue.length = 0
			}
		}
	}
}

// global queue for api requests (no artificial rate limiting)
export const apiQueue = createQueue()
