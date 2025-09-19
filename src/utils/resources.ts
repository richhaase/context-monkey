import fs from 'fs';
import path from 'path';

export interface MarkdownTemplate {
  filePath: string;
  relativePath: string;
  fileName: string;
  frontmatter: Record<string, string>;
  body: string;
}

function parseFrontmatter(content: string): { frontmatter: Record<string, string>; body: string } {
  if (!content.startsWith('---')) {
    return { frontmatter: {}, body: content.trim() };
  }

  const endIndex = content.indexOf('\n---', 3);
  if (endIndex === -1) {
    return { frontmatter: {}, body: content.trim() };
  }

  const frontmatterBlock = content.slice(3, endIndex).trim();
  const body = content.slice(endIndex + 4).trim();
  const lines = frontmatterBlock.split(/\r?\n/);
  const frontmatter: Record<string, string> = {};
  for (const line of lines) {
    const separatorIndex = line.indexOf(':');
    if (separatorIndex === -1) {
      continue;
    }
    const key = line.slice(0, separatorIndex).trim().toLowerCase();
    const value = line.slice(separatorIndex + 1).trim();
    if (key.length > 0) {
      frontmatter[key] = value.replace(/^"|"$/g, '');
    }
  }
  return { frontmatter, body };
}

function collectMarkdownTemplates(rootDir: string): MarkdownTemplate[] {
  const templates: MarkdownTemplate[] = [];

  const stack: string[] = [''];
  while (stack.length > 0) {
    const relative = stack.pop() as string;
    const currentDir = path.join(rootDir, relative);
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const entryRelative = path.join(relative, entry.name);
      const entryPath = path.join(rootDir, entryRelative);
      if (entry.isDirectory()) {
        stack.push(entryRelative);
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        const raw = fs.readFileSync(entryPath, 'utf8');
        const { frontmatter, body } = parseFrontmatter(raw);
        templates.push({
          filePath: entryPath,
          relativePath: entryRelative,
          fileName: entry.name,
          frontmatter,
          body,
        });
      }
    }
  }

  return templates;
}

export function loadCommandTemplates(resourcesDir: string): MarkdownTemplate[] {
  const commandsDir = path.join(resourcesDir, 'commands');
  if (!fs.existsSync(commandsDir)) {
    return [];
  }
  return collectMarkdownTemplates(commandsDir);
}

export function loadAgentTemplates(resourcesDir: string): MarkdownTemplate[] {
  const agentsDir = path.join(resourcesDir, 'agents');
  if (!fs.existsSync(agentsDir)) {
    return [];
  }
  return collectMarkdownTemplates(agentsDir);
}
