import fs from 'fs'
import path from 'path'
import { execSync, spawnSync } from 'child_process'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const logDir = path.join('db', 'logs')
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir)

const timestamp = new Date()
  .toISOString()
  .replace(/[-:]/g, '')
  .replace(/\..+/, '')
  .replace('T', '_')

const logFile = path.join(logDir, `index_creation_${timestamp}.log`)

function log(message: string): void {
  const timestamped = `[${new Date().toISOString().replace('T', ' ').split('.')[0]}] ${message}`
  console.log(timestamped)
  fs.appendFileSync(logFile, `${timestamped}\n`)
}

function getPostgresContainer(): string | null {
  try {
    const result = execSync(`docker ps --filter "ancestor=postgres" --format "{{.ID}}"`)
      .toString()
      .split('\n')[0]
      .trim()
    return result || null
  } catch {
    return null
  }
}

function indexExists(containerId: string, indexName: string): boolean {
  const cmd = `SELECT to_regclass('${indexName}') IS NOT NULL;`
  const result = spawnSync(
    'docker',
    [
      'exec',
      '-i',
      containerId,
      'env',
      `PGPASSWORD=${process.env.POSTGRES_PASSWORD}`,
      'psql',
      '-h',
      process.env.POSTGRES_HOST as string,
      '-p',
      process.env.POSTGRES_PORT as string,
      '-U',
      process.env.POSTGRES_USER as string,
      '-d',
      process.env.POSTGRES_DB as string,
      '-tAc',
      cmd,
    ],
    { encoding: 'utf8' },
  )

  return result.stdout.trim() === 't'
}

function executeSQL(
  containerId: string,
  description: string,
  indexName: string,
  sql: string,
): void {
  log(`Checking index: ${indexName} (${description})`)

  if (indexExists(containerId, indexName)) {
    log(`Skipping ${description} — index '${indexName}' already exists.`)
    log('-------------------------------------------------------------')
    return
  }

  log(`Creating index: ${description}`)
  const startTime = Date.now()

  const result = spawnSync(
    'docker',
    [
      'exec',
      '-i',
      containerId,
      'env',
      `PGPASSWORD=${process.env.POSTGRES_PASSWORD}`,
      'psql',
      '-h',
      process.env.POSTGRES_HOST as string,
      '-p',
      process.env.POSTGRES_PORT as string,
      '-U',
      process.env.POSTGRES_USER as string,
      '-d',
      process.env.POSTGRES_DB as string,
    ],
    {
      input: sql,
      encoding: 'utf8',
    },
  )

  fs.appendFileSync(logFile, result.stdout || '')
  fs.appendFileSync(logFile, result.stderr || '')

  const duration = Math.round((Date.now() - startTime) / 1000)
  log(`Finished: ${description} (Duration: ${duration}s)`)
  log('-------------------------------------------------------------')
}

function main(): void {
  log(`Target database: ${process.env.POSTGRES_DB}`)

  const containerId = getPostgresContainer()
  if (!containerId) {
    log('No running PostgreSQL container found.')
    process.exit(1)
  }

  const indexList = `
Output.address|idx_output_address|CREATE INDEX idx_output_address ON "Output"(address);
Output.previous|idx_output_previous|CREATE INDEX idx_output_previous ON "Output"(previous);
Output.isTbcOutput|idx_output_istbcoutput|CREATE INDEX idx_output_istbcoutput ON "Output"("isTbcOutput");
Output.blockHash|idx_output_blockhash|CREATE INDEX idx_output_blockhash ON "Output"("blockHash");
Output.asm|idx_output_asm|CREATE INDEX idx_output_asm ON "Output"("asm");
Output.mod|idx_output_mod|CREATE INDEX idx_output_mod ON "Output"("mod");
Output.rev|idx_output_rev_substr|CREATE INDEX idx_output_rev_substr ON "Output"((SUBSTRING("rev" FROM 1 FOR 64)));
Orphan.height|idx_orphan_height|CREATE INDEX idx_orphan_height ON "Orphan"(height);
Input.outputSpent|idx_input_outputSpent|CREATE INDEX idx_input_outputSpent ON "Input"("outputSpent");
Input.blockHash|idx_input_blockhash|CREATE INDEX idx_input_blockhash ON "Input"("blockHash");
Block.height|idx_block_height|CREATE INDEX idx_block_height ON "Block"(height);
  `.trim()

  for (const line of indexList.split('\n')) {
    const [description, indexName, sql] = line.split('|')
    executeSQL(containerId, description, indexName, sql)
  }
}

main()
