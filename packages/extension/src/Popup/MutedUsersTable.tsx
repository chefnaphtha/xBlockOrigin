import { useState } from 'preact/hooks'
import type { MutedUser } from '../Storage/schema'

type SortField = 'username' | 'country' | 'mutedAt'
type SortDirection = 'asc' | 'desc'

type MutedUsersTableProps = {
	users: MutedUser[]
}

export function MutedUsersTable({ users }: MutedUsersTableProps) {
	const [sortField, setSortField] = useState<SortField>('mutedAt')
	const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

	const handleSort = (field: SortField) => {
		if (sortField === field) {
			setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
		} else {
			setSortField(field)
			setSortDirection('asc')
		}
	}

	const sortedUsers = [...users].sort((a, b) => {
		let comparison = 0

		switch (sortField) {
			case 'username':
				comparison = a.username.localeCompare(b.username)
				break
			case 'country':
				comparison = a.country.localeCompare(b.country)
				break
			case 'mutedAt':
				comparison = a.mutedAt - b.mutedAt
				break
		}

		return sortDirection === 'asc' ? comparison : -comparison
	})

	if (users.length === 0) {
		return (
			<div
				style={{
					padding: '32px',
					textAlign: 'center',
					color: 'var(--text-secondary)',
					fontSize: '14px'
				}}
			>
				No muted users yet
			</div>
		)
	}

	return (
		<div
			style={{
				padding: '16px',
				maxHeight: '400px',
				overflowY: 'auto'
			}}
		>
			<h2 style={{ margin: '0 0 12px 0', fontSize: '20px' }}>
				Muted Users
			</h2>
			<table
				style={{
					width: '100%',
					borderCollapse: 'collapse',
					fontSize: '14px'
				}}
			>
				<thead>
					<tr style={{ borderBottom: '2px solid var(--border)' }}>
						<th
							onClick={() => handleSort('username')}
							style={{
								padding: '8px',
								textAlign: 'left',
								cursor: 'pointer',
								userSelect: 'none'
							}}
						>
							Username{' '}
							{sortField === 'username' &&
								(sortDirection === 'asc' ? '↑' : '↓')}
						</th>
						<th
							onClick={() => handleSort('country')}
							style={{
								padding: '8px',
								textAlign: 'left',
								cursor: 'pointer',
								userSelect: 'none'
							}}
						>
							Country{' '}
							{sortField === 'country' &&
								(sortDirection === 'asc' ? '↑' : '↓')}
						</th>
						<th
							onClick={() => handleSort('mutedAt')}
							style={{
								padding: '8px',
								textAlign: 'left',
								cursor: 'pointer',
								userSelect: 'none'
							}}
						>
							Muted Date{' '}
							{sortField === 'mutedAt' &&
								(sortDirection === 'asc' ? '↑' : '↓')}
						</th>
					</tr>
				</thead>
				<tbody>
					{sortedUsers.map((user) => (
						<tr
							key={user.username}
							style={{ borderBottom: '1px solid var(--border)' }}
						>
							<td style={{ padding: '8px' }}>@{user.username}</td>
							<td style={{ padding: '8px' }}>{user.country}</td>
							<td style={{ padding: '8px' }}>
								{new Date(user.mutedAt).toLocaleDateString()}
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	)
}
