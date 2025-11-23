import { useEffect, useState } from 'preact/hooks'

export function Settings() {
	const [showFlags, setShowFlags] = useState(false)
	const [loading, setLoading] = useState(true)

	// load settings on mount
	useEffect(() => {
		chrome.storage.sync.get('showFlags').then((result) => {
			setShowFlags(result.showFlags ?? false)
			setLoading(false)
		})
	}, [])

	const handleToggle = async () => {
		const newValue = !showFlags
		await chrome.storage.sync.set({ showFlags: newValue })
		setShowFlags(newValue)
	}

	if (loading) {
		return null
	}

	return (
		<div
			style={{
				padding: '16px',
				borderBottom: '1px solid var(--border)'
			}}
		>
			<h2 style={{ margin: '0 0 12px 0', fontSize: '20px' }}>Settings</h2>

			<label
				style={{
					display: 'flex',
					alignItems: 'center',
					gap: '8px',
					cursor: 'pointer',
					fontSize: '14px'
				}}
			>
				<input
					type="checkbox"
					checked={showFlags}
					onChange={handleToggle}
					style={{ cursor: 'pointer' }}
				/>
				<span>Show country flags on posts</span>
			</label>
		</div>
	)
}
