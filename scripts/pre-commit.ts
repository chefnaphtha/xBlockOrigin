#!/usr/bin/env bun
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'

const packageJsonPath = join(process.cwd(), 'package.json')

// read package.json
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))

// parse current version
const currentVersion = packageJson.version
const [major, minor, patch] = currentVersion.split('.').map(Number)

// increment major version
const newVersion = `${major + 1}.0.0`

// update package.json
packageJson.version = newVersion
writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, '\t') + '\n')

console.log(`[pre-commit] Version bumped: ${currentVersion} → ${newVersion}`)

// stage package.json
const gitAdd = spawnSync('git', ['add', 'package.json'], {
	stdio: 'inherit',
	cwd: process.cwd()
})

if (gitAdd.status !== 0) {
	console.error('[pre-commit] Failed to stage package.json')
	process.exit(1)
}
