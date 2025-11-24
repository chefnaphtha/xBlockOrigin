import { useEffect, useState } from 'preact/hooks'
import { getSettings, updateSettings } from '../Storage/settings'
import type { Settings as SettingsType } from '../Storage/schema'

export function Settings() {
	const [settings, setSettings] = useState<SettingsType>({
		showFlags: false,
		muteFollowing: false
	})
	const [loading, setLoading] = useState(true)

	// load settings on mount
	useEffect(() => {
		getSettings().then((result) => {
			setSettings(result)
			setLoading(false)
		})

		// listen for changes
		const listener = (
			changes: { [key: string]: chrome.storage.StorageChange },
			areaName: string
		) => {
			if (areaName === 'sync' && changes.settings) {
				if (changes.settings.newValue) {
					setSettings(changes.settings.newValue)
				}
			}
		}

		chrome.storage.onChanged.addListener(listener)
		return () => chrome.storage.onChanged.removeListener(listener)
	}, [])

	const handleToggleShowFlags = async () => {
		const newSettings = { ...settings, showFlags: !settings.showFlags }
		await updateSettings(newSettings)
		setSettings(newSettings)
	}

	const handleToggleMuteFollowing = async () => {
		const newSettings = {
			...settings,
			muteFollowing: !settings.muteFollowing
		}
		await updateSettings(newSettings)
		setSettings(newSettings)
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

			<div
				style={{
					display: 'flex',
					flexDirection: 'column',
					gap: '12px'
				}}
			>
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
						checked={settings.showFlags}
						onChange={handleToggleShowFlags}
						style={{ cursor: 'pointer' }}
					/>
					<span>Show country flags on posts</span>
				</label>

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
						checked={settings.muteFollowing}
						onChange={handleToggleMuteFollowing}
						style={{ cursor: 'pointer' }}
					/>
					<span>Also mute users you are following</span>
				</label>
			</div>
		</div>
	)
}
