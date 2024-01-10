#!/usr/bin/env node

import { execSync } from 'child_process'
import fs from 'fs'

const repoUrl = 'git@github.com:bitcoin-computer/monorepo.git'

try {
  try {
    execSync(`git clone ${repoUrl}`, { stdio: 'inherit' })
  } catch (error) {
    console.log('Not able to clone monorepo')  
  }
  process.chdir('monorepo')
  execSync('yarn install', { stdio: 'inherit' })
  console.log('Repository cloned and bootstrapped successfully!')  
  const app = process.argv[2]

  if (app) {
    process.chdir(`packages/${app}`)
    console.log(`Changing directory to ${app}...`)
    if (app === 'BRC20' || app === 'BRC721' || app === 'node-js-boilerplate') {
      execSync('npm run test', { stdio: 'inherit' })
    } else if (app && app === 'node') {
      if (!fs.existsSync('.env')) {
        execSync('cp .env.example .env', { stdio: 'inherit' })
        console.log('Copied .env.example to .env')
      }
      const args = process.argv.slice(3)
      console.log(`Running 'npm run up -- ${args}`)
      execSync(`npm run up -- ${args}`, { stdio: 'inherit' })
    } else execSync('npm run start', { stdio: 'inherit' })
     
  }
} catch (error) {
  console.error(`Error while cloning or bootstrapping repository: ${error}`)
}