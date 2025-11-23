import { BlacklistManager } from './BlacklistManager'
import { useBlacklist } from './hooks'

export function BlacklistSection() {
	const { blacklist, addCountry, removeCountry, loading } = useBlacklist()

	if (loading) {
		return null
	}

	return (
		<BlacklistManager
			blacklist={blacklist}
			onAdd={addCountry}
			onRemove={removeCountry}
		/>
	)
}
