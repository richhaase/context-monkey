export const CODEX_PROMPT_PREFIX = 'cm-';
export const CODEX_LEGACY_PROMPT_PREFIXES = ['context-monkey-', CODEX_PROMPT_PREFIX];
export const CODEX_AGENTS_BEGIN_MARKER = '<!-- CONTEXT_MONKEY:BEGIN -->';
export const CODEX_AGENTS_END_MARKER = '<!-- CONTEXT_MONKEY:END -->';

export function stripCodexAgentsBlock(content: string): string {
  if (!content) {
    return '';
  }
  const beginIndex = content.indexOf(CODEX_AGENTS_BEGIN_MARKER);
  const endIndex = content.indexOf(CODEX_AGENTS_END_MARKER);
  if (beginIndex === -1 || endIndex === -1) {
    return content;
  }
  const before = content.slice(0, beginIndex).trimEnd();
  const after = content.slice(endIndex + CODEX_AGENTS_END_MARKER.length).trimStart();
  const pieces = [];
  if (before.length > 0) {
    pieces.push(before);
  }
  if (after.length > 0) {
    pieces.push(after);
  }
  return pieces.join('\n\n');
}
