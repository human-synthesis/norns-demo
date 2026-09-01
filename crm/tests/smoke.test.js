import { afterAll, beforeAll, describe, expect, test } from 'bun:test';
import { spawn } from 'node:child_process';
import { openSync, rmSync } from 'node:fs';
import { chromium } from 'playwright';

const PORT = 5191;
const BASE = `http://localhost:${PORT}`;
const ROOT = new URL('..', import.meta.url).pathname;

let server;
let browser;

async function waitForServer(url, timeoutMs = 60_000) {
	const deadline = Date.now() + timeoutMs;
	let streak = 0;
	while (Date.now() < deadline) {
		try {
			const res = await fetch(url);
			streak = res.ok ? streak + 1 : 0;
		} catch {
			streak = 0;
		}
		if (streak >= 4) return;
		await new Promise((r) => setTimeout(r, 750));
	}
	throw new Error(`dev server did not become ready at ${url}`);
}

beforeAll(async () => {
	// fresh seed every run — dev.db is disposable local state
	rmSync(`${ROOT}.norns/dev.db`, { force: true });
	const log = openSync('/tmp/crm-smoke-server.log', 'w');
	server = spawn('bun', ['run', 'dev', '--port', String(PORT)], {
		cwd: ROOT,
		stdio: ['ignore', log, log],
		detached: true
	});
	await waitForServer(BASE + '/companies');
	browser = await chromium.launch();

	// warm-up: absorb cold-cache dep optimization + first-click hiccup
	const page = await browser.newPage();
	try {
		await page.goto(BASE + '/activities', { waitUntil: 'load', timeout: 30_000 });
		await page.waitForTimeout(3_000);
	} catch {}
	await page.close();
}, 120_000);

afterAll(async () => {
	await browser?.close();
	if (server?.pid) {
		try {
			process.kill(-server.pid, 'SIGTERM');
		} catch {}
	}
});

describe('CRM generated pages smoke', () => {
	test('/activities renders the Kanban grouped by status', async () => {
		const page = await browser.newPage();
		const pageErrors = [];
		page.on('pageerror', (e) => pageErrors.push(String(e)));
		try {
			await page.goto(BASE + '/activities', { waitUntil: 'load' });
			await page.waitForSelector('.kanban-card');
			const titles = await page.locator('.kanban-column-title').allTextContents();
			expect(titles).toContain('Planned');
			expect(titles).toContain('Done');
			expect(await page.locator('.kanban-card').count()).toBe(4);
			await expect(page.getByText('Kickoff call').isVisible()).resolves.toBe(true);
			expect(pageErrors).toEqual([]);
		} finally {
			await page.close();
		}
	}, 30_000);

	test('dragging a card fires the bound action and persists the move', async () => {
		const page = await browser.newPage();
		try {
			await page.goto(BASE + '/activities', { waitUntil: 'load' });
			await page.waitForSelector('.kanban-card');
			const card = page.locator('.kanban-card', { hasText: 'Kickoff call' });
			const doneColumn = page.locator('.kanban-column', {
				has: page.locator('.kanban-column-title', { hasText: 'Done' })
			});
			const posted = page.waitForResponse(
				(res) => res.url().includes('/activities?/complete') && res.request().method() === 'POST',
				{ timeout: 10_000 }
			);
			await card.dragTo(doneColumn);
			expect((await posted).status()).toBe(200);
			// optimistic move
			await expect(
				doneColumn.locator('.kanban-card', { hasText: 'Kickoff call' }).isVisible()
			).resolves.toBe(true);
			// server truth after a full reload
			await page.reload({ waitUntil: 'load' });
			await page.waitForSelector('.kanban-card');
			await expect(
				page
					.locator('.kanban-column', {
						has: page.locator('.kanban-column-title', { hasText: 'Done' })
					})
					.locator('.kanban-card', { hasText: 'Kickoff call' })
					.isVisible()
			).resolves.toBe(true);
		} finally {
			await page.close();
		}
	}, 30_000);

	test('/stats renders the Chart with one bar per deal', async () => {
		const page = await browser.newPage();
		const pageErrors = [];
		page.on('pageerror', (e) => pageErrors.push(String(e)));
		try {
			await page.goto(BASE + '/stats', { waitUntil: 'load' });
			await page.waitForSelector('.chart-root svg');
			expect(await page.locator('rect.chart-bar').count()).toBe(3);
			const labels = await page.locator('.chart-label').allTextContents();
			expect(labels).toContain('Acme expansion');
			expect(pageErrors).toEqual([]);
		} finally {
			await page.close();
		}
	}, 30_000);

	test('/deals renders the custom PipelineTotals component beside the Kanban', async () => {
		const page = await browser.newPage();
		const pageErrors = [];
		page.on('pageerror', (e) => pageErrors.push(String(e)));
		try {
			await page.goto(BASE + '/deals', { waitUntil: 'load' });
			await page.waitForSelector('.pipeline-totals');
			await page.waitForSelector('.kanban-card');
			const open = page.locator('.pipeline-total[data-status="open"]');
			await expect(open.locator('.pipeline-total-amount').textContent()).resolves.toBe('$42,000');
			const all = page.locator('.pipeline-total[data-status="all"]');
			await expect(all.locator('.pipeline-total-amount').textContent()).resolves.toBe('$65,000');
			expect(pageErrors).toEqual([]);
		} finally {
			await page.close();
		}
	}, 30_000);

	test('a win in one client live-updates the board in another without reload', async () => {
		const pageA = await browser.newPage();
		const pageB = await browser.newPage();
		const pageErrors = [];
		pageA.on('pageerror', (e) => pageErrors.push(String(e)));
		try {
			await pageA.goto(BASE + '/deals', { waitUntil: 'load' });
			await pageA.waitForSelector('.kanban-card');
			// let the EventSource in pageA's $effect attach before mutating
			await pageA.waitForTimeout(1_500);

			await pageB.goto(BASE + '/deals', { waitUntil: 'load' });
			await pageB.waitForSelector('.kanban-card');
			const card = pageB.locator('.kanban-card', { hasText: 'Acme expansion' });
			const wonColumn = pageB.locator('.kanban-column', {
				has: pageB.locator('.kanban-column-title', { hasText: 'Won' })
			});
			const posted = pageB.waitForResponse(
				(res) => res.url().includes('/deals?/win') && res.request().method() === 'POST',
				{ timeout: 10_000 }
			);
			await card.dragTo(wonColumn);
			expect((await posted).status()).toBe(200);

			// pageA gets the refresh over /_norns/live SSE → invalidate → reload data
			const wonColumnA = pageA.locator('.kanban-column', {
				has: pageA.locator('.kanban-column-title', { hasText: 'Won' })
			});
			await wonColumnA
				.locator('.kanban-card', { hasText: 'Acme expansion' })
				.waitFor({ timeout: 15_000 });
			await expect(
				pageA
					.locator('.pipeline-total[data-status="won"] .pipeline-total-amount')
					.textContent()
			).resolves.toBe('$60,000');
			await expect(
				pageA
					.locator('.pipeline-total[data-status="all"] .pipeline-total-amount')
					.textContent()
			).resolves.toBe('$65,000');
			expect(pageErrors).toEqual([]);
		} finally {
			await pageA.close();
			await pageB.close();
		}
	}, 45_000);

	test('/companies renders the Table with seeded rows', async () => {
		const page = await browser.newPage();
		try {
			await page.goto(BASE + '/companies', { waitUntil: 'load' });
			await page.waitForSelector('.table-root tbody tr');
			expect(await page.locator('tbody tr').count()).toBe(2);
			await expect(page.getByText('Acme Corp').first().isVisible()).resolves.toBe(true);
		} finally {
			await page.close();
		}
	}, 30_000);
});
