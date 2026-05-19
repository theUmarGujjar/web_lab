const { spawn } = require('child_process');
const http = require('http');
const path = require('path');

const cwd = path.join(__dirname, '..');

function waitForServer(child, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Server start timeout')), timeout);
    child.stdout.on('data', (chunk) => {
      const s = chunk.toString();
      // console.log('STDOUT:', s);
      if (s.includes('Server is running')) {
        clearTimeout(timer);
        resolve();
      }
    });
    child.stderr.on('data', (c) => {
      const s = c.toString();
      if (s.includes('Server is running')) {
        clearTimeout(timer);
        resolve();
      }
    });
  });
}

function httpGet(pathname) {
  return new Promise((resolve, reject) => {
    const req = http.get({ host: '127.0.0.1', port: 3000, path: pathname, timeout: 3000 }, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', d => body += d);
      res.on('end', () => resolve({ statusCode: res.statusCode, body }));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(new Error('timeout')); });
  });
}

async function run() {
  const child = spawn('node', ['server.js'], { cwd, stdio: ['ignore', 'pipe', 'pipe'] });
  child.unref && child.unref();

  try {
    await waitForServer(child, 7000);
  } catch (err) {
    console.error('Server did not start in time:', err.message);
    child.kill();
    process.exit(2);
  }

  try {
    const page = await httpGet('/sales');
    console.log('/sales status:', page.statusCode, 'length:', page.body.length);
  } catch (err) {
    console.error('/sales fetch failed:', err.message);
  }

  try {
    const api = await httpGet('/sales/api');
    console.log('/sales/api status:', api.statusCode, 'body snippet:', api.body.slice(0, 200));
  } catch (err) {
    console.error('/sales/api fetch failed:', err.message);
  }

  child.kill();
  process.exit(0);
}

run();
