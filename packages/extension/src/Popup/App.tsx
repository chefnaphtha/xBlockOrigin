import { BlacklistSection } from './BlacklistSection'
import { DebugPanel } from './DebugPanel'
import { MutedUsersSection } from './MutedUsersSection'
import { Settings } from './Settings'
import { WhitelistSection } from './WhitelistSection'

export function App() {
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

			<Settings />
			<BlacklistSection />
			<WhitelistSection />
			<MutedUsersSection />
			<DebugPanel />
		</div>
	)
}
