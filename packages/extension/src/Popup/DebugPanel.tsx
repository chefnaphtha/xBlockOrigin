import { useEffect, useState } from 'preact/hooks'
import type { UnmuteMode, UnmuteProgress } from '../Utils/unmuteService'
import { UnmuteConfirmDialog } from './components/UnmuteConfirmDialog'
import { UnmuteModeSelector } from './components/UnmuteModeSelector'
import { UnmuteProgressDisplay } from './components/UnmuteProgressDisplay'

export function DebugPanel() {
	const [mode, setMode] = useState<UnmuteMode>('extension-only')
	const [progress, setProgress] = useState<UnmuteProgress | null>(null)
	const [showConfirm, setShowConfirm] = useState(false)

	useEffect(() => {
		const listener = (message: {
			type: string
			progress?: UnmuteProgress
			succeeded?: number
			failed?: number
		}) => {
			if (message.type === 'UNMUTE_PROGRESS' && message.progress) {
				setProgress(message.progress)
			}

			if (message.type === 'UNMUTE_COMPLETE') {
			}
		}

		chrome.runtime.onMessage.addListener(listener)
		return () => chrome.runtime.onMessage.removeListener(listener)
	}, [])

	const handleStartUnmute = () => {
		setShowConfirm(true)
	}

	const handleConfirmUnmute = async () => {
		setShowConfirm(false)

		try {
			const [tab] = await chrome.tabs.query({
				active: true,
				currentWindow: true
			})
			if (!tab?.id) {
				throw new Error('No active tab found')
			}

			setProgress({
				total: mode === 'all' ? null : 0, // will be set when fetching starts
				completed: 0,
				failed: 0,
				currentUser: null,
				isRunning: true,
				isCancelled: false
			})

			chrome.tabs.sendMessage(tab.id, {
				type: 'START_UNMUTE',
				mode
			})

			// refresh the progress after completion
			setTimeout(() => {
				setProgress(null)
			}, 3000)
		} catch (error) {
			alert('Failed to start unmute. Make sure you are on x.com')
		}
	}

	const handleCancel = async () => {
		try {
			const [tab] = await chrome.tabs.query({
				active: true,
				currentWindow: true
			})
			if (!tab?.id) {
				return
			}

			await chrome.tabs.sendMessage(tab.id, {
				type: 'CANCEL_UNMUTE'
			})
		} catch (error) {}
	}

	return (
		<div
			style={{
				padding: '16px',
				borderTop: '2px solid var(--border)',
				background: 'var(--background-secondary)'
			}}
		>
			<h2
				style={{
					margin: '0 0 12px 0',
					fontSize: '18px',
					color: 'var(--error)'
				}}
			>
				⚠️ Debug Tools
			</h2>

			<UnmuteModeSelector
				mode={mode}
				disabled={progress?.isRunning ?? false}
				onModeChange={setMode}
			/>

			{!progress && (
				<button
					type="button"
					onClick={handleStartUnmute}
					style={{
						width: '100%',
						padding: '12px',
						background: 'var(--error)',
						color: 'white',
						border: 'none',
						fontSize: '14px',
						fontWeight: 'bold',
						cursor: 'pointer'
					}}
				>
					{mode === 'all'
						? 'Unmute All Accounts'
						: 'Unmute Extension Accounts'}
				</button>
			)}

			{showConfirm && (
				<UnmuteConfirmDialog
					mode={mode}
					onConfirm={handleConfirmUnmute}
					onCancel={() => setShowConfirm(false)}
				/>
			)}

			{progress && (
				<UnmuteProgressDisplay
					progress={progress}
					onCancel={handleCancel}
				/>
			)}

			{/* Warning */}
			<div
				style={{
					marginTop: '16px',
					padding: '12px',
					background: 'var(--warning-bg)',
					border: '1px solid var(--warning-border)',
					fontSize: '12px',
					color: 'var(--warning-text)'
				}}
			>
				<strong>Warning:</strong> Unmuting is irreversible. The
				extension cannot automatically re-mute these users.
			</div>
		</div>
	)
}
