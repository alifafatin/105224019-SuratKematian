const { spawn } = require('node:child_process');
const path = require('node:path');

const appDirectory = path.resolve(__dirname, '..');
const processes = [];
let shuttingDown = false;

function stop(code) {
  if (shuttingDown) return;
  shuttingDown = true;
  process.exitCode = code;
  for (const child of processes) {
    if (child.exitCode === null && !child.killed) child.kill();
  }
}

function start(label, executable, args, cwd) {
  const child = spawn(executable, args, {
    cwd,
    stdio: 'inherit',
    env: process.env,
  });
  processes.push(child);
  child.on('error', (error) => {
    console.error(`Gagal menjalankan ${label}:`, error);
    stop(1);
  });
  child.on('exit', (code, signal) => {
    if (shuttingDown) return;
    if (signal) {
      console.error(`${label} berhenti karena sinyal ${signal}.`);
    } else if (code !== 0) {
      console.error(`${label} berhenti dengan kode ${code}.`);
    }
    stop(code ?? 1);
  });
}

const backendDirectory = path.join(appDirectory, 'backend');
const nextCli = path.join(appDirectory, 'node_modules', 'next', 'dist', 'bin', 'next');

start('Backend Surkem', process.execPath, ['server.js'], backendDirectory);
start('Next.js', process.execPath, [nextCli, 'dev'], appDirectory);

process.on('SIGINT', () => stop(130));
process.on('SIGTERM', () => stop(143));
