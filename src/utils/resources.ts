import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export interface MarkdownTemplate {
  filePath: string;
  relativePath: string;
  fileName: string;
  frontmatter: Record<string, string>;
  body: string;
  resourcesRoot: string;
  agentRefs: string[];
}

function parseFrontmatter(content: string): { frontmatter: Record<string, string>; body: string } {
  const parsed = matter(content);
  const frontmatter: Record<string, string> = {};
  Object.entries(parsed.data ?? {}).forEach(([key, value]) => {
    const normalizedKey = key.toLowerCase();
    if (typeof value === 'string') {
      frontmatter[normalizedKey] = value;
    } else {
      frontmatter[normalizedKey] = JSON.stringify(value);
    }
  });
  return { frontmatter, body: parsed.content.trim() };
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
        const resourcesRoot = path.dirname(rootDir);
        const agentRefs = extractAgentReferences(raw);
        templates.push({
          filePath: entryPath,
          relativePath: entryRelative,
          fileName: entry.name,
          frontmatter,
          body,
          resourcesRoot,
          agentRefs,
        });
      }
    }
  }

  return templates;
}

function extractAgentReferences(content: string): string[] {
  const matches = content.match(/cm-[a-z0-9-]+/gi) ?? [];
  const unique = Array.from(new Set(matches.map(name => name.toLowerCase())));
  return unique;
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
