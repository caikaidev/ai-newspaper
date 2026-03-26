#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const repoDir = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..')
const readmePath = path.join(repoDir, 'README.md')
const configPath = path.join(repoDir, 'newspaper.config.json')

const START = '<!-- CONFIG_SNIPPET:START -->'
const END = '<!-- CONFIG_SNIPPET:END -->'

const readme = fs.readFileSync(readmePath, 'utf8')
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'))
const snippet = '```json\n' + JSON.stringify(config, null, 2) + '\n```'

const startIndex = readme.indexOf(START)
const endIndex = readme.indexOf(END)

if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) {
  throw new Error('README markers not found for config snippet sync')
}

const before = readme.slice(0, startIndex + START.length)
const after = readme.slice(endIndex)
const updated = `${before}\n\n${snippet}\n\n${after}`

fs.writeFileSync(readmePath, updated)
console.log('[sync] README config snippet updated from newspaper.config.json')
