import type { HarnessContext, HarnessId } from "../model/context.ts";
import { claudeCodeScanner } from "./claude-code.ts";
import { codexScanner } from "./codex.ts";
import { copilotScanner } from "./copilot.ts";
import { cursorScanner } from "./cursor.ts";
import { geminiScanner } from "./gemini.ts";
import type { Scanner } from "./scanner.ts";

export const scanners: Scanner[] = [
  claudeCodeScanner,
  codexScanner,
  geminiScanner,
  cursorScanner,
  copilotScanner,
];

export function getScanner(id: HarnessId): Scanner | undefined {
  return scanners.find((s) => s.id === id);
}

export async function detectAll(root: string): Promise<Scanner[]> {
  const results = await Promise.all(
    scanners.map(async (s) => ({ scanner: s, found: await s.detect(root) })),
  );
  return results.filter((r) => r.found).map((r) => r.scanner);
}

export async function scanAll(root: string, filter?: HarnessId[]): Promise<HarnessContext[]> {
  const detected = await detectAll(root);
  const filtered = filter?.length ? detected.filter((s) => filter.includes(s.id)) : detected;
  return Promise.all(filtered.map((s) => s.scan(root)));
}
