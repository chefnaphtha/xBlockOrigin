import { downloadCSV } from '../Utils/csvExporter'
import type { MutedUser } from '../Storage/schema'

type ExportButtonProps = {
	users: MutedUser[]
}

export function ExportButton({ users }: ExportButtonProps) {
	const handleExport = () => {
		const filename = `muted-users-${new Date().toISOString().split('T')[0]}.csv`
		downloadCSV(users, filename)
	}

	return (
		<button
			type="button"
			onClick={handleExport}
			disabled={users.length === 0}
			style={{
				width: '100%',
				padding: '12px',
				background:
					users.length === 0 ? 'var(--border)' : 'var(--accent)',
				color: 'white',
				border: 'none',
				fontSize: '14px',
				fontWeight: 'bold',
				cursor: users.length === 0 ? 'not-allowed' : 'pointer'
			}}
		>
			Export to CSV ({users.length} users)
		</button>
	)
}
