// V4-T3 (D24): e2e coverage is DERIVED from the specs — this bridge only
// hands the smoke matrix to bun test / CI. To grow coverage, add checks in
// specs/*.t (`pages.<name>.expect`, role/text/count), never test code here.
//
// The runner lives in @human-synthesis/norns-mcp (git-only, private repo).
// Without it installed — e.g. a standalone clone of this template — the
// bridge skips rather than failing the suite.
import { expect, test } from 'bun:test';

test('derived smoke matrix', async () => {
	let smokeMatrix;
	try {
		({ smokeMatrix } = await import('@human-synthesis/norns-mcp/smoke'));
	} catch {
		console.warn('norns-mcp not installed (private, git-only) — smoke matrix skipped');
		return;
	}
	const report = await smokeMatrix(new URL('..', import.meta.url).pathname);
	expect(report.failures ?? []).toEqual([]);
	expect(report.notFoundOk).toBe(true);
}, 180_000);
