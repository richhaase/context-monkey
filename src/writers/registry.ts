import type { HarnessId } from "../model/context.ts";
import { claudeCodeWriter } from "./claude-code.ts";
import { codexWriter } from "./codex.ts";
import { cursorWriter } from "./cursor.ts";
import { geminiWriter } from "./gemini.ts";
import type { Writer } from "./writer.ts";

export const writers: Writer[] = [claudeCodeWriter, codexWriter, geminiWriter, cursorWriter];

export function getWriter(id: HarnessId): Writer | undefined {
  return writers.find((w) => w.id === id);
}
