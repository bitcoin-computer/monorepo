import { spawnSync } from 'child_process';
import * as dotenv from 'dotenv';
import fs from 'fs';

// executes a shell script in the DB container
async function execDbCommand(command) {
  const containerIdDbResult = spawnSync('docker', ['ps', '-qf', 'ancestor=postgres']);
  if (containerIdDbResult.status !== 0) {
    throw new Error(`Command failed: ${command}\n${result.stderr.toString()}`);
  }
  const containerIdDb = containerIdDbResult.stdout.toString().trim();
  const result = spawnSync('docker', [
    'exec',
    containerIdDb,
    'psql',
    '-U',
    process.env.POSTGRES_USER,
    '-d',
    process.env.POSTGRES_DB,
    '-c',
    command,
  ]);
  return result.stdout.toString().trim();
}

// executes a shell script in the node container
async function execNodeCommand(command) {
  const containerIdNodeResult = spawnSync('docker', ['ps', '-qf', `ancestor=${process.env.BITCOIN_IMAGE}`]);
  if (containerIdNodeResult.status !== 0) {
    throw new Error(`Command failed: ${command}\n${result.stderr.toString()}`);
  }
  const containerIdNode = containerIdNodeResult.stdout.toString().trim();
  const result = spawnSync('docker', [
    'exec',
    containerIdNode,
    '/bin/bash',
    '-c',
    command,
  ]);
  return result.stdout.toString().trim();
}

function getDebugPath() {
  switch (process.env.BCN_NETWORK) {
    case 'mainnet':
      return `${process.env.BITCOIN_DATA_DIR}/debug.log`;
    case 'testnet':
      return `${process.env.BITCOIN_DATA_DIR}/testnet4/debug.log`;
    case 'regtest':
      return `${process.env.BITCOIN_DATA_DIR}/regtest/debug.log`;
    default:
      throw new Error('Invalid network');
  }
}

async function main() {
  dotenv.config();
  
  // Format the date and time
  const currentDate = new Date();
  const formattedDateTime = currentDate.toISOString().replace('T', ' ').split('.')[0];

  // Node
  const nodeOutput = await execNodeCommand(`cat ${getDebugPath()} | tail -1000 | grep "UpdateTip" | tail -n 1 `);
  const heightMatch = nodeOutput.match(/height=(\d+)/);
  const nodeHeight = heightMatch ? heightMatch[1] : 'N/A';
  const progressMatch = nodeOutput.match(/progress=(\d+\.\d+)/);
  const progress = progressMatch ? (Math.round(parseFloat(progressMatch[1])*100*100)/100).toFixed(2) : 'N/A';
  const progressValue = progressMatch ? parseFloat(progressMatch[1]) : 0;
  const nodeHeightK = nodeHeight?.slice(0, -3);

  // Coordinator
  const coordinatorDbHeight = await execDbCommand('select bs."blockToSync" from "BlockStatus" bs LIMIT 1');
  const coordinatorDbHeightValue = parseInt(coordinatorDbHeight.split('\n')[2]?.trim());
  const coordinatorProgress =Math.round(progressValue*10000*coordinatorDbHeightValue / nodeHeight)/100;
  const coordinatorHeightK = coordinatorDbHeight?.split('\n')[2]?.trim().slice(0, -3);

  // Workers
  const workersDbHeight = await execDbCommand('select max(ts."blockToSync") as max from "TxStatus" ts');
  const workersDbHeightValue = parseInt(workersDbHeight.split('\n')[2]?.trim());
  const workersProgress = Math.round(progressValue*10000*workersDbHeightValue / nodeHeight)/100;
  const workersHeightK = workersDbHeight?.split('\n')[2]?.trim().slice(0, -3);


  // Only add the header if the file does not exist
  let table='';
  if (!fs.existsSync('/tmp/metrics.log')) {
    // Create a Markdown table
    table = `|        Time         |      Node (K)     |  Coordinator (K)  |    Workers (K)   |\n`
   table += `|---------------------|-------------------|-------------------|------------------|\n`
  }
  table += `| ${formattedDateTime} | `
  table += `${nodeHeightK.padStart(9)} (${progress}%) | `
  table += `${coordinatorHeightK.padStart(9)} (${coordinatorProgress}%) | `
  table += `${workersHeightK.padStart(8)} (${workersProgress}%) |\n`;

  // Write the table to a file or log it
  console.log(table);
  // Append the table to the file
  fs.appendFileSync('/tmp/metrics.log', table);
}

main().catch((error) => {
  console.error('Error:', error);
});