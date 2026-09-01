// Drives the R-13 spike against `wrangler dev` in fully-local mode (workerd,
// no account, no deploy). Exits 0 only if all three primitives hold.
import { spawn } from 'node:child_process';

const PORT = 8799;
const BASE = `http://127.0.0.1:${PORT}`;

const dev = spawn('bunx', ['wrangler', 'dev', '--local', '--port', String(PORT)], {
	cwd: import.meta.dirname,
	stdio: ['ignore', 'pipe', 'pipe'],
	env: { ...process.env, CI: '1', WRANGLER_SEND_METRICS: 'false' },
	detached: true
});
let log = '';
dev.stdout.on('data', (d) => (log += d));
dev.stderr.on('data', (d) => (log += d));

const fail = (msg) => {
	console.error('SPIKE FAIL:', msg);
	console.error(log.slice(-2000));
	process.exitCode = 1;
};

try {
	// wait for the worker to answer
	let up = false;
	for (let i = 0; i < 120 && !up; i++) {
		await new Promise((r) => setTimeout(r, 500));
		up = await fetch(BASE + '/').then((r) => r.ok).catch(() => false);
	}
	if (!up) throw new Error('wrangler dev never came up');

	// 1. WebSocket into the DO
	const ws = new WebSocket(`ws://127.0.0.1:${PORT}/ws`);
	const messages = [];
	ws.addEventListener('message', (e) => messages.push(JSON.parse(e.data)));
	await new Promise((resolve, reject) => {
		ws.addEventListener('open', resolve);
		ws.addEventListener('error', () => reject(new Error('ws failed to open')));
	});

	// 2. server-side push reaches the socket (POST → DO broadcast)
	const send = await fetch(BASE + '/send').then((r) => r.json());
	if (send.clients !== 1) throw new Error(`expected 1 ws client, got ${send.clients}`);
	// 3. client → DO → broadcast echo
	ws.send('hello');
	await new Promise((r) => setTimeout(r, 500));
	if (!messages.some((m) => m.push && m.count === 1)) throw new Error('push broadcast not received: ' + JSON.stringify(messages));
	if (!messages.some((m) => m.echo === 'hello' && m.count === 2)) throw new Error('ws echo not received: ' + JSON.stringify(messages));

	// 4. SSE stream out of the same DO, seeing the same in-memory state
	const sse = await fetch(BASE + '/sse');
	if (!sse.headers.get('content-type')?.includes('text/event-stream')) throw new Error('not an SSE response');
	const text = await sse.text();
	const ticks = [...text.matchAll(/data: (\{.*\})/g)].map((m) => JSON.parse(m[1]));
	if (ticks.length !== 3) throw new Error(`expected 3 SSE ticks, got ${ticks.length}: ${text}`);
	if (ticks[0].count !== 2) throw new Error(`SSE did not see DO state (count ${ticks[0].count}, want 2)`);

	// 5. state survives across requests on the instance
	const after = await fetch(BASE + '/').then((r) => r.json());
	if (after.count !== 2) throw new Error(`cross-request state lost (count ${after.count})`);

	ws.close();
	console.log('SPIKE PASS: ws broadcast ✓  sse stream ✓  DO in-memory state across requests ✓');
} catch (e) {
	fail(e.message);
} finally {
	try {
		process.kill(-dev.pid, 'SIGTERM');
	} catch {}
}
