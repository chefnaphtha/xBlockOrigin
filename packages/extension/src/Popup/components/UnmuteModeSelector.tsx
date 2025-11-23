import type { UnmuteMode } from '../../Utils/unmuteService'

function isUnmuteMode(value: string): value is UnmuteMode {
	return value === 'all' || value === 'extension-only'
}

type Props = {
	mode: UnmuteMode
	disabled: boolean
	onModeChange: (mode: UnmuteMode) => void
}

export function UnmuteModeSelector({ mode, disabled, onModeChange }: Props) {
	return (
		<div style={{ marginBottom: '16px' }}>
			<div
				style={{
					marginBottom: '8px',
					fontSize: '14px',
					fontWeight: 'bold'
				}}
			>
				Unmute Mode:
			</div>
			<label
				style={{
					display: 'block',
					marginBottom: '8px',
					fontSize: '14px',
					cursor: 'pointer'
				}}
			>
				<input
					type="radio"
					value="extension-only"
					checked={mode === 'extension-only'}
					onChange={(e) => {
						if (isUnmuteMode(e.currentTarget.value)) {
							onModeChange(e.currentTarget.value)
						}
					}}
					disabled={disabled}
					style={{ marginRight: '8px' }}
				/>
				Unmute only extension-muted accounts
			</label>
			<label
				style={{
					display: 'block',
					fontSize: '14px',
					cursor: 'pointer'
				}}
			>
				<input
					type="radio"
					value="all"
					checked={mode === 'all'}
					onChange={(e) => {
						if (isUnmuteMode(e.currentTarget.value)) {
							onModeChange(e.currentTarget.value)
						}
					}}
					disabled={disabled}
					style={{ marginRight: '8px' }}
				/>
				Unmute ALL muted accounts (⚠️ IRREVERSIBLE)
			</label>
		</div>
	)
}
