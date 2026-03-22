import type { ContextEntry, HarnessId } from "../model/context.ts";

/**
 * A portable setting that has equivalents across harnesses.
 */
export interface PortableSetting {
  key: string;
  displayName: string;
  value: string;
  sourceHarness: HarnessId;
  /** Where this setting lives in each target harness */
  equivalents: Partial<Record<HarnessId, SettingEquivalent>>;
}

export interface SettingEquivalent {
  file: string;
  path: string;
  format: "json" | "toml" | "frontmatter";
  notes?: string;
}

/**
 * Known portable settings across harnesses.
 * Each entry defines where the same concept lives in each harness.
 */
const PORTABLE_KEYS: Array<{
  key: string;
  displayName: string;
  harnesses: Partial<
    Record<HarnessId, { file: string; path: string; format: "json" | "toml" | "frontmatter" }>
  >;
}> = [
  {
    key: "model",
    displayName: "Default Model",
    harnesses: {
      "claude-code": { file: ".claude/settings.json", path: "model", format: "json" },
      codex: { file: ".codex/config.toml", path: "model", format: "toml" },
      gemini: { file: ".gemini/settings.json", path: "model", format: "json" },
    },
  },
  {
    key: "mcp-servers",
    displayName: "MCP Servers",
    harnesses: {
      "claude-code": { file: ".mcp.json", path: "mcpServers", format: "json" },
      codex: { file: ".codex/config.toml", path: "mcp_servers", format: "toml" },
      gemini: { file: ".gemini/settings.json", path: "mcpServers", format: "json" },
    },
  },
  {
    key: "permissions",
    displayName: "Tool Permissions",
    harnesses: {
      "claude-code": { file: ".claude/settings.json", path: "permissions", format: "json" },
      codex: { file: ".codex/config.toml", path: "permissions", format: "toml" },
    },
  },
];

/**
 * Evaluate which settings are portable from a source harness's settings entries.
 */
export function evaluateSettings(
  settingsEntries: ContextEntry[],
  sourceHarness: HarnessId,
): PortableSetting[] {
  const results: PortableSetting[] = [];

  for (const portableKey of PORTABLE_KEYS) {
    const sourceSpec = portableKey.harnesses[sourceHarness];
    if (!sourceSpec) continue;

    // Try to extract the value from the source settings
    const matchingEntry = settingsEntries.find(
      (e) => e.sourcePath.endsWith(sourceSpec.file) || e.name === sourceSpec.file.split("/").pop(),
    );
    if (!matchingEntry) continue;

    const value = extractValue(matchingEntry.content, sourceSpec.path, sourceSpec.format);
    if (value === null) continue;

    const equivalents: Partial<Record<HarnessId, SettingEquivalent>> = {};
    for (const [harnessId, spec] of Object.entries(portableKey.harnesses)) {
      if (harnessId === sourceHarness) continue;
      equivalents[harnessId as HarnessId] = {
        file: spec.file,
        path: spec.path,
        format: spec.format,
        notes: portableKey.key === "model" ? "Model names differ between providers" : undefined,
      };
    }

    results.push({
      key: portableKey.key,
      displayName: portableKey.displayName,
      value,
      sourceHarness,
      equivalents,
    });
  }

  return results;
}

function extractValue(
  content: string,
  path: string,
  format: "json" | "toml" | "frontmatter",
): string | null {
  if (format === "json") {
    try {
      const obj = JSON.parse(content);
      const val = obj[path];
      if (val === undefined) return null;
      return typeof val === "string" ? val : JSON.stringify(val, null, 2);
    } catch {
      return null;
    }
  }

  if (format === "toml") {
    // Simple TOML extraction — look for key = value at top level
    const regex = new RegExp(`^${path}\\s*=\\s*(.+)$`, "m");
    const match = content.match(regex);
    if (!match) return null;
    return match[1]!.trim().replace(/^"|"$/g, "");
  }

  return null;
}
