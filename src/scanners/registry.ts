import type { HarnessContext, HarnessId } from "../model/context.ts";
import { claudeCodeScanner } from "./claude-code.ts";
import { codexScanner } from "./codex.ts";
import { cursorScanner } from "./cursor.ts";
import { geminiScanner } from "./gemini.ts";
import type { Scanner } from "./scanner.ts";

export const scanners: Scanner[] = [claudeCodeScanner, codexScanner, geminiScanner, cursorScanner];

export function getScanner(id: HarnessId): Scanner | undefined {
  return scanners.find((s) => s.id === id);
}

export async function detectAll(workspaceRoot?: string): Promise<Scanner[]> {
  const results = await Promise.all(
    scanners.map(async (s) => ({ scanner: s, found: await s.detect(workspaceRoot) })),
  );
  return results.filter((r) => r.found).map((r) => r.scanner);
}

export async function scanAll(
  filter?: HarnessId[],
  workspaceRoot?: string,
): Promise<HarnessContext[]> {
  const detected = await detectAll(workspaceRoot);
  const filtered = filter?.length ? detected.filter((s) => filter.includes(s.id)) : detected;
  return Promise.all(filtered.map((s) => s.scan(workspaceRoot)));
}
