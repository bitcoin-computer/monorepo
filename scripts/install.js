#!/usr/bin/env node

import { execSync } from 'child_process'

const repoUrl = 'git@github.com:bitcoin-computer/monorepo.git'

try {
  execSync(`git clone ${repoUrl}`, { stdio: 'inherit' })
  process.chdir('monorepo')
  execSync('lerna bootstrap', { stdio: 'inherit' })
  console.log('Repository cloned and bootstrapped successfully!')
  const app = process.argv[2]

  if (app) {
    process.chdir(`packages/${app}`)
    execSync('npm install && npm run start', { stdio: 'inherit' })
  }
} catch (error) {
  console.error(`Error while cloning or bootstrapping repository: ${error}`)
}