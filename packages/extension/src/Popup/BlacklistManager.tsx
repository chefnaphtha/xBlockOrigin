import { useState } from 'preact/hooks'

type BlacklistManagerProps = {
	blacklist: string[]
	onAdd: (country: string) => void
	onRemove: (country: string) => void
}

export function BlacklistManager({
	blacklist,
	onAdd,
	onRemove
}: BlacklistManagerProps) {
	const [input, setInput] = useState('')

	const handleAdd = () => {
		const trimmed = input.trim()
		if (trimmed) {
			onAdd(trimmed)
			setInput('')
		}
	}

	const handleKeyPress = (e: KeyboardEvent) => {
		if (e.key === 'Enter') {
			handleAdd()
		}
	}

	return (
		<div
			style={{
				padding: '16px',
				borderBottom: '1px solid var(--border)'
			}}
		>
			<h2 style={{ margin: '0 0 12px 0', fontSize: '20px' }}>
				Country Blacklist
			</h2>

			<div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
				<input
					type="text"
					value={input}
					onChange={(e) => setInput(e.currentTarget.value)}
					onKeyPress={handleKeyPress}
					placeholder="Enter country name..."
					style={{
						flex: 1,
						padding: '8px 12px',
						border: '1px solid var(--border)',
						fontSize: '14px',
						background: 'var(--background)',
						color: 'var(--text-primary)'
					}}
				/>
				<button
					type="button"
					onClick={handleAdd}
					style={{
						padding: '8px 16px',
						background: 'var(--accent)',
						color: 'white',
						border: 'none',
						fontSize: '14px',
						fontWeight: 'bold',
						cursor: 'pointer'
					}}
				>
					Add
				</button>
			</div>

			{blacklist.length === 0 ? (
				<div
					style={{ fontSize: '14px', color: 'var(--text-secondary)' }}
				>
					No countries in blacklist
				</div>
			) : (
				<div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
					{blacklist.map((country) => (
						<div
							key={country}
							style={{
								display: 'flex',
								alignItems: 'center',
								gap: '8px',
								padding: '6px 12px',
								background: 'var(--background-tertiary)',
								fontSize: '14px'
							}}
						>
							<span>{country}</span>
							<button
								type="button"
								onClick={() => onRemove(country)}
								style={{
									background: 'none',
									border: 'none',
									color: 'var(--text-secondary)',
									cursor: 'pointer',
									padding: 0,
									fontSize: '16px',
									lineHeight: 1
								}}
							>
								×
							</button>
						</div>
					))}
				</div>
			)}
		</div>
	)
}
