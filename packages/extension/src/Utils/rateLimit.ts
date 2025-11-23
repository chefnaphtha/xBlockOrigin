type QueuedTask = {
	fn: () => Promise<unknown>
	resolve: (value: unknown) => void
	reject: (error: unknown) => void
}

export function createQueue() {
	const queue: QueuedTask[] = []
	let isProcessing = false

	async function processQueue() {
		if (isProcessing || queue.length === 0) {
			return
		}

		isProcessing = true

		while (queue.length > 0) {
			const task = queue.shift()
			if (!task) break

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
		enqueue<T>(fn: () => Promise<T>): Promise<T> {
			return new Promise<T>((resolve, reject) => {
				queue.push({
					fn,
					resolve: (value) => resolve(value as T),
					reject
				})
				processQueue()
			})
		},

		getQueueLength(): number {
			return queue.length
		}
	}
}

// global queue for api requests (no artificial rate limiting)
export const apiQueue = createQueue()
