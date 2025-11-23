import type { MutedUser } from '../Storage/schema'

// convert muted users array to csv string
export function generateCSV(users: MutedUser[]): string {
	const headers = ['Username', 'Country', 'Muted Date']
	const rows = users.map((user) => [
		user.username,
		user.country,
		new Date(user.mutedAt).toISOString()
	])

	const csvRows = [headers, ...rows].map((row) =>
		row.map((cell) => `"${cell}"`).join(',')
	)

	return csvRows.join('\n')
}

// trigger browser download of csv file
export function downloadCSV(users: MutedUser[], filename: string): void {
	const csv = generateCSV(users)
	const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
	const url = URL.createObjectURL(blob)

	const link = document.createElement('a')
	link.href = url
	link.download = filename
	link.style.display = 'none'

	document.body.appendChild(link)
	link.click()
	document.body.removeChild(link)

	URL.revokeObjectURL(url)
}
