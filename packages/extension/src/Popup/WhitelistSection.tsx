import { WhitelistManager } from './WhitelistManager'
import { useWhitelist } from './hooks'

export function WhitelistSection() {
	const { users, loading, reload } = useWhitelist()

	if (loading) {
		return null
	}

	return <WhitelistManager whitelist={users} onUpdate={reload} />
}
