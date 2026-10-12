import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import http from 'node:http';

test('server serves app assets and survives malformed URLs', { timeout: 10000 }, async t => {
  const child = spawn(process.execPath, ['server.js'], {
    cwd: new URL('../', import.meta.url),
    env: { ...process.env, PORT: '0' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  t.after(() => new Promise(resolve => {
    if (child.exitCode !== null || child.signalCode !== null) return resolve();
    child.once('exit', resolve);
    child.kill();
  }));
  const port = await new Promise((resolve, reject) => {
    let output = '';
    child.once('error', reject);
    child.once('exit', code => reject(new Error(`Server exited early: ${code}`)));
    child.stdout.on('data', chunk => {
      output += chunk;
      const match = output.match(/localhost:(\d+)/);
      if (match) resolve(Number(match[1]));
    });
  });
  function request(path, method = 'GET') {
    return new Promise((resolve, reject) => {
      const req = http.request({ hostname: '127.0.0.1', port, path, method }, res => {
        let body = '';
        res.setEncoding('utf8');
        res.on('data', chunk => { body += chunk; });
        res.on('end', () => resolve({ status: res.statusCode, body, headers: res.headers }));
      });
      req.on('error', reject);
      req.end();
    });
  }
  assert.equal((await request('http://[')).status, 400);
  for (const path of ['/', '/app.js', '/tasks.js', '/storage.js', '/dom.js', '/styles.css']) {
    const response = await request(path);
    assert.equal(response.status, 200, path);
    assert.ok(response.body.length > 0, path);
  }
  assert.equal((await request('/.git/config')).status, 404);
  const post = await request('/', 'POST');
  assert.equal(post.status, 405);
  assert.equal(post.headers.allow, 'GET, HEAD');
  const head = await request('/', 'HEAD');
  assert.equal(head.status, 200);
  assert.equal(head.body, '');
});
