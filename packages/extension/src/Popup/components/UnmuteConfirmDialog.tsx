import type { UnmuteMode } from '../../Utils/unmuteService'

type Props = {
	mode: UnmuteMode
	onConfirm: () => void
	onCancel: () => void
}

export function UnmuteConfirmDialog({ mode, onConfirm, onCancel }: Props) {
	return (
		<div
			style={{
				marginTop: '16px',
				padding: '16px',
				background: 'var(--warning-bg)',
				border: '2px solid var(--error)'
			}}
		>
			<div
				style={{
					fontSize: '14px',
					fontWeight: 'bold',
					marginBottom: '8px'
				}}
			>
				⚠️ Are you sure?
			</div>
			<div style={{ fontSize: '14px', marginBottom: '12px' }}>
				{mode === 'all'
					? 'This will unmute ALL muted accounts. This action cannot be undone!'
					: 'This will unmute all accounts muted by this extension.'}
			</div>
			<div style={{ display: 'flex', gap: '8px' }}>
				<button
					type="button"
					onClick={onConfirm}
					style={{
						flex: 1,
						padding: '8px',
						background: 'var(--error)',
						color: 'white',
						border: 'none',
						fontWeight: 'bold',
						cursor: 'pointer'
					}}
				>
					Yes, Unmute
				</button>
				<button
					type="button"
					onClick={onCancel}
					style={{
						flex: 1,
						padding: '8px',
						background: 'var(--text-secondary)',
						color: 'white',
						border: 'none',
						fontWeight: 'bold',
						cursor: 'pointer'
					}}
				>
					Cancel
				</button>
			</div>
		</div>
	)
}
