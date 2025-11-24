#!/usr/bin/env bun
import { existsSync, mkdirSync, writeFileSync, chmodSync } from 'node:fs'
import { join } from 'node:path'

const gitHooksDir = join(process.cwd(), '.git', 'hooks')
const preCommitPath = join(gitHooksDir, 'pre-commit')

// check if .git/hooks exists
if (!existsSync(gitHooksDir)) {
	console.error('Error: .git/hooks directory not found. Are you in a git repository?')
	process.exit(1)
}

// create pre-commit hook
const hookContent = `#!/bin/sh
bun run scripts/pre-commit.ts
`

writeFileSync(preCommitPath, hookContent, { mode: 0o755 })
console.log('✓ Pre-commit hook installed at .git/hooks/pre-commit')
