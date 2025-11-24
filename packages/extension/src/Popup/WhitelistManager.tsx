import { useState } from 'preact/hooks'
import type { WhitelistedUser } from '../Storage/schema'
import { getUserData } from '../Api/userDataQuery'
import { addToWhitelist, removeFromWhitelist } from '../Storage/whitelist'

type WhitelistManagerProps = {
	whitelist: WhitelistedUser[]
	onUpdate: () => void
}

export function WhitelistManager({
	whitelist,
	onUpdate
}: WhitelistManagerProps) {
	const [input, setInput] = useState('')
	const [adding, setAdding] = useState(false)
	const [error, setError] = useState('')

	const handleAdd = async () => {
		const username = input.trim().replace(/^@/, '')
		if (!username) {
			return
		}

		setAdding(true)
		setError('')

		try {
			const userData = await getUserData(username)

			if (!userData) {
				setError(`User @${username} not found`)
				setAdding(false)
				return
			}

			await addToWhitelist(userData.userId, username)
			setInput('')
			onUpdate()
		} catch (err) {
			setError('Failed to add user')
		} finally {
			setAdding(false)
		}
	}

	const handleRemove = async (userId: string) => {
		await removeFromWhitelist(userId)
		onUpdate()
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
				Whitelisted Users
			</h2>

			<div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
				<input
					type="text"
					value={input}
					onChange={(e) => setInput(e.currentTarget.value)}
					onKeyPress={handleKeyPress}
					placeholder="Enter username..."
					disabled={adding}
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
					disabled={adding}
					style={{
						padding: '8px 16px',
						background: 'var(--accent)',
						color: 'white',
						border: 'none',
						fontSize: '14px',
						fontWeight: 'bold',
						cursor: adding ? 'wait' : 'pointer',
						opacity: adding ? 0.6 : 1
					}}
				>
					{adding ? 'Adding...' : 'Add'}
				</button>
			</div>

			{error && (
				<div
					style={{
						fontSize: '14px',
						color: 'var(--error)',
						marginBottom: '12px'
					}}
				>
					{error}
				</div>
			)}

			{whitelist.length === 0 ? (
				<div
					style={{ fontSize: '14px', color: 'var(--text-secondary)' }}
				>
					No whitelisted users
				</div>
			) : (
				<div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
					{whitelist.map((user) => (
						<div
							key={user.userId}
							style={{
								display: 'flex',
								alignItems: 'center',
								gap: '8px',
								padding: '6px 12px',
								background: 'var(--background-tertiary)',
								fontSize: '14px'
							}}
						>
							<span>@{user.username}</span>
							<button
								type="button"
								onClick={() => handleRemove(user.userId)}
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
