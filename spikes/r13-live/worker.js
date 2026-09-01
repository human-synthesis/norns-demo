// R-13 spike — the three primitives R-08 (Room host) and R-11 (live queries)
// need from workerd, exercised in one Durable Object:
//   1. WebSocket pairs accepted + broadcast from a DO
//   2. SSE streaming out of a DO
//   3. cross-request in-memory state on one DO instance
export class Room {
	constructor(state) {
		this.state = state;
		this.clients = new Set();
		this.count = 0;
	}

	async fetch(request) {
		const url = new URL(request.url);

		if (url.pathname === '/ws') {
			const pair = new WebSocketPair();
			const [client, server] = Object.values(pair);
			server.accept();
			this.clients.add(server);
			server.addEventListener('message', (e) => {
				this.count += 1;
				for (const ws of this.clients) ws.send(JSON.stringify({ echo: String(e.data), count: this.count }));
			});
			server.addEventListener('close', () => this.clients.delete(server));
			return new Response(null, { status: 101, webSocket: client });
		}

		if (url.pathname === '/sse') {
			const { readable, writable } = new TransformStream();
			const writer = writable.getWriter();
			const enc = new TextEncoder();
			let n = 0;
			const timer = setInterval(() => {
				n += 1;
				writer.write(enc.encode(`data: {"tick":${n},"count":${this.count}}\n\n`));
				if (n >= 3) {
					clearInterval(timer);
					writer.close();
				}
			}, 50);
			return new Response(readable, {
				headers: { 'content-type': 'text/event-stream', 'cache-control': 'no-cache' }
			});
		}

		if (url.pathname === '/send') {
			this.count += 1;
			for (const ws of this.clients) ws.send(JSON.stringify({ push: true, count: this.count }));
			return Response.json({ ok: true, clients: this.clients.size, count: this.count });
		}

		return Response.json({ count: this.count });
	}
}

export default {
	async fetch(request, env) {
		const id = env.ROOM.idFromName('spike');
		return env.ROOM.get(id).fetch(request);
	}
};
