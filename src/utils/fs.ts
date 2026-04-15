import type { Dirent } from "node:fs";
import { readdir, stat } from "node:fs/promises";
import { join, relative } from "node:path";

const WALK_SKIP_DIRS = new Set([".git", "node_modules", ".next", "dist", "build"]);

export async function exists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

export async function readFileIfExists(path: string): Promise<string | null> {
  try {
    return await Bun.file(path).text();
  } catch {
    return null;
  }
}

export async function globSkillDirs(skillsRoot: string): Promise<string[]> {
  try {
    const entries = await readdir(skillsRoot, { withFileTypes: true });
    const dirs: string[] = [];
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const skillMd = join(skillsRoot, entry.name, "SKILL.md");
        if (await exists(skillMd)) {
          dirs.push(entry.name);
        }
      }
    }
    return dirs.sort();
  } catch {
    return [];
  }
}

export async function globFiles(dir: string, ext: string): Promise<string[]> {
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isFile() && entry.name.endsWith(ext))
      .map((entry) => entry.name)
      .sort();
  } catch {
    return [];
  }
}

export async function walkFiles(
  root: string,
  predicate?: (path: string) => boolean,
): Promise<string[]> {
  const files: string[] = [];

  async function visit(dir: string): Promise<void> {
    let entries: Dirent[];
    try {
      entries = await readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) {
        if (WALK_SKIP_DIRS.has(entry.name)) continue;
        await visit(path);
        continue;
      }
      if (!entry.isFile()) continue;
      if (!predicate || predicate(path)) {
        files.push(path);
      }
    }
  }

  await visit(root);
  return files.sort();
}

export function relativeDisplayPath(root: string, path: string): string {
  const rel = relative(root, path);
  return rel.length === 0 ? "." : rel;
}
