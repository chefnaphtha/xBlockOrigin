import { ExportButton } from './ExportButton'
import { MutedUsersTable } from './MutedUsersTable'
import { Stats } from './Stats'
import { useMutedUsers } from './hooks'

export function MutedUsersSection() {
	const { users, loading } = useMutedUsers()

	if (loading) {
		return null
	}

	return (
		<>
			<Stats users={users} />
			<MutedUsersTable users={users} />
			<div style={{ padding: '16px' }}>
				<ExportButton users={users} />
			</div>
		</>
	)
}
