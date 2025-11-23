import { BlacklistManager } from './BlacklistManager'
import { DebugPanel } from './DebugPanel'
import { ExportButton } from './ExportButton'
import { MutedUsersTable } from './MutedUsersTable'
import { Stats } from './Stats'
import { useBlacklist, useMutedUsers } from './hooks'

export function App() {
	const {
		blacklist,
		addCountry,
		removeCountry,
		loading: blacklistLoading
	} = useBlacklist()
	const { users, loading: usersLoading } = useMutedUsers()

	if (blacklistLoading || usersLoading) {
		return (
			<div
				style={{
					padding: '32px',
					textAlign: 'center',
					color: 'var(--text-secondary)'
				}}
			>
				Loading...
			</div>
		)
	}

	return (
		<div>
			<div
				style={{
					padding: '16px',
					background: 'var(--accent)',
					color: 'white',
					fontWeight: 'bold',
					fontSize: '18px'
				}}
			>
				xBlockOrigin
			</div>

			<BlacklistManager
				blacklist={blacklist}
				onAdd={addCountry}
				onRemove={removeCountry}
			/>

			<Stats users={users} />

			<MutedUsersTable users={users} />

			<div style={{ padding: '16px' }}>
				<ExportButton users={users} />
			</div>

			<DebugPanel />
		</div>
	)
}
