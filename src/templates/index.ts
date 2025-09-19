import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import { visit } from 'unist-util-visit';
import matter from 'gray-matter';
import type { Heading, Root } from 'mdast';

import type { MarkdownTemplate } from '../utils/resources.js';
import { TargetAgent } from '../types/index.js';
import { CODEX_PROMPT_PREFIX } from '../utils/codex.js';

export interface RenderedCommand {
  targetRelativePath: string;
  format: 'markdown' | 'toml';
  content: string;
  description?: string;
}

export function renderCommandForTarget(
  template: MarkdownTemplate,
  target: TargetAgent
): RenderedCommand {
  switch (target) {
    case TargetAgent.CLAUDE_CODE:
      return renderForClaude(template);
    case TargetAgent.CODEX_CLI:
      return renderForCodex(template);
    case TargetAgent.GEMINI_CLI:
      return renderForGemini(template);
    default:
      throw new Error(`Unsupported target for command rendering: ${target}`);
  }
}

function renderForClaude(template: MarkdownTemplate): RenderedCommand {
  const raw = matter.stringify(template.body, template.frontmatter);
  return {
    targetRelativePath: template.relativePath,
    format: 'markdown',
    content: normalizeTrailingNewline(raw),
    description: template.frontmatter.description,
  };
}

function renderForCodex(template: MarkdownTemplate): RenderedCommand {
  const slug = createCodexPromptSlug(template.relativePath);
  const content = transformCodexMarkdown(template.body);
  return {
    targetRelativePath: `${slug}.md`,
    format: 'markdown',
    content: normalizeTrailingNewline(content),
    description: template.frontmatter.description,
  };
}

function renderForGemini(template: MarkdownTemplate): RenderedCommand {
  const description = template.frontmatter.description ?? 'Context Monkey command';
  const targetRelativePath = template.relativePath.replace(/\.md$/i, '.toml');
  const prompt = transformGeminiPrompt(template.body);
  const toml = [
    `description = "${escapeTomlString(description)}"`,
    'prompt = """',
    prompt,
    '"""',
    '',
  ].join('\n');

  return {
    targetRelativePath,
    format: 'toml',
    content: normalizeTrailingNewline(toml),
    description,
  };
}

function createCodexPromptSlug(relativePath: string): string {
  const withoutExt = relativePath.replace(/\.md$/i, '');
  const normalized = withoutExt.replace(/[\\/]+/g, '-');
  const sanitized = normalized.replace(/[^a-zA-Z0-9-]/g, '-').replace(/-+/g, '-');
  const trimmed = sanitized.replace(/^-/, '').replace(/-$/, '') || 'prompt';
  return `${CODEX_PROMPT_PREFIX}${trimmed}`.toLowerCase();
}

function transformCodexMarkdown(markdown: string): string {
  const processor = unified().use(remarkParse).use(remarkStringify, {
    fence: '`',
    fences: true,
    bullet: '-',
    listItemIndent: 'one',
  });

  const tree = processor.parse(markdown) as Root;

  visit(tree, 'text', node => {
    if (typeof node.value !== 'string') {
      return;
    }
    node.value = node.value
      .replace(/Claude Code/gi, 'Codex CLI')
      .replace(/\bsubagent(s)?\b/gi, 'workflow$1')
      .replace(/Task tool/gi, 'internal workflow')
      .replace(/cm-([a-z-]+)/gi, 'Context Monkey $1 workflow')
      .replace(/\/cm:/g, '/cm-')
      .replace(/@\.cm\/[\w\-.]+/g, 'project documentation');
  });

  removeSection(tree, heading => /when this command runs/i.test(getHeadingText(heading)));

  const result = processor.stringify(tree);
  return result.trim();
}

function transformGeminiPrompt(markdown: string): string {
  const processor = unified().use(remarkParse).use(remarkStringify, {
    fence: '`',
    fences: true,
    bullet: '-',
    listItemIndent: 'one',
  });

  const tree = processor.parse(markdown) as Root;

  visit(tree, 'text', node => {
    if (typeof node.value !== 'string') {
      return;
    }
    node.value = node.value.replace(/@\.cm\/[\w\-.]+/g, 'project documentation');
  });

  const result = processor.stringify(tree);
  return result.trim();
}

function removeSection(tree: Root, predicate: (heading: Heading) => boolean): void {
  if (!Array.isArray(tree.children)) {
    return;
  }

  const nodes = tree.children;
  for (let index = 0; index < nodes.length; index += 1) {
    const node = nodes[index];
    if (node.type !== 'heading') {
      continue;
    }
    const heading = node as Heading;
    if (!predicate(heading)) {
      continue;
    }

    const startDepth = heading.depth;

    nodes.splice(index, 1);

    while (index < nodes.length) {
      const next = nodes[index];
      if (next.type === 'heading' && (next as Heading).depth <= startDepth) {
        break;
      }
      nodes.splice(index, 1);
    }
    index -= 1;
  }
}

function getHeadingText(heading: Heading): string {
  return (heading.children || [])
    .map(child => ('value' in child ? (child as { value: string }).value : ''))
    .join('')
    .trim();
}

function escapeTomlString(value: string): string {
  return value.replace(/"/g, '\\"');
}

function normalizeTrailingNewline(value: string): string {
  return value.endsWith('\n') ? value : `${value}\n`;
}
