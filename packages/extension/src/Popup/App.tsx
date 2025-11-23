import { BlacklistSection } from './BlacklistSection'
import { DebugPanel } from './DebugPanel'
import { MutedUsersSection } from './MutedUsersSection'

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

			<BlacklistSection />
			<MutedUsersSection />
			<DebugPanel />
		</div>
	)
}
