import type { MutedUser } from '../Storage/schema'

type StatsProps = {
	users: MutedUser[]
}

export function Stats({ users }: StatsProps) {
	const countsByCountry = users.reduce<Record<string, number>>(
		(acc, user) => {
			acc[user.country] = (acc[user.country] || 0) + 1
			return acc
		},
		{}
	)

	const topCountries = Object.entries(countsByCountry)
		.sort((a, b) => b[1] - a[1])
		.slice(0, 5)

	return (
		<div
			style={{
				padding: '16px',
				borderBottom: '1px solid var(--border)'
			}}
		>
			<h2 style={{ margin: '0 0 12px 0', fontSize: '20px' }}>
				Statistics
			</h2>
			<div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
				<div style={{ marginBottom: '8px' }}>
					<strong>Total Muted:</strong> {users.length} users
				</div>
				{topCountries.length > 0 && (
					<div>
						<strong>Top Countries:</strong>
						<ul
							style={{ margin: '4px 0 0 0', paddingLeft: '20px' }}
						>
							{topCountries.map(([country, count]) => (
								<li key={country}>
									{country}: {count}
								</li>
							))}
						</ul>
					</div>
				)}
			</div>
		</div>
	)
}
