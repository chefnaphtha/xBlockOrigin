import type { UnmuteProgress } from '../../Utils/unmuteService'

type Props = {
	progress: UnmuteProgress
	onCancel: () => void
}

export function UnmuteProgressDisplay({ progress, onCancel }: Props) {
	const progressPercent = progress.total
		? Math.round((progress.completed / progress.total) * 100)
		: 0

	return (
		<div
			style={{
				marginTop: '16px',
				padding: '16px',
				background: 'var(--background)',
				border: '1px solid var(--border)'
			}}
		>
			<div style={{ fontSize: '14px', marginBottom: '8px' }}>
				{progress.isRunning
					? `Unmuting ${progress.currentUser}...`
					: progress.isCancelled
						? 'Operation cancelled'
						: 'Completed!'}
			</div>

			{progress.total !== null && (
				<div
					style={{
						width: '100%',
						height: '8px',
						background: 'var(--background-tertiary)',
						overflow: 'hidden',
						marginBottom: '8px'
					}}
				>
					<div
						style={{
							width: `${progressPercent}%`,
							height: '100%',
							background:
								progress.failed > 0
									? 'var(--error)'
									: 'var(--accent)',
							transition: 'width 0.3s ease'
						}}
					/>
				</div>
			)}

			<div
				style={{
					fontSize: '14px',
					color: 'var(--text-secondary)'
				}}
			>
				{progress.total !== null ? (
					<div>
						Progress: {progress.completed} / {progress.total} (
						{progressPercent}
						%)
					</div>
				) : (
					<div>Unmuted: {progress.completed}</div>
				)}
				<div>Succeeded: {progress.completed - progress.failed}</div>
				<div>Failed: {progress.failed}</div>
			</div>

			{progress.isRunning && (
				<button
					type="button"
					onClick={onCancel}
					style={{
						width: '100%',
						marginTop: '12px',
						padding: '8px',
						background: 'var(--error)',
						color: 'white',
						border: 'none',
						fontWeight: 'bold',
						cursor: 'pointer'
					}}
				>
					Cancel
				</button>
			)}
		</div>
	)
}
