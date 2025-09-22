import fs from 'fs';
import path from 'path';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import { visit } from 'unist-util-visit';
import matter from 'gray-matter';
import type { Heading, Root } from 'mdast';

import type { MarkdownTemplate } from '../utils/resources.js';
import { TargetAgent } from '../types/index.js';
import { CODEX_PROMPT_PREFIX } from '../utils/codex.js';
import { AGENT_RENDER_RULES, type AgentRenderRule } from '../config/agents.js';
import {
  buildTemplateContext,
  getHandlebarsEnvironment,
  type AgentTemplateContext,
} from './handlebars.js';

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

const AGENT_CONTEXTS: Record<TargetAgent, AgentTemplateContext> = {
  [TargetAgent.CLAUDE_CODE]: {
    id: TargetAgent.CLAUDE_CODE,
    name: 'Claude Code',
    supportsSubagents: true,
  },
  [TargetAgent.CODEX_CLI]: {
    id: TargetAgent.CODEX_CLI,
    name: 'Codex CLI',
    supportsSubagents: false,
  },
  [TargetAgent.GEMINI_CLI]: {
    id: TargetAgent.GEMINI_CLI,
    name: 'Gemini CLI',
    supportsSubagents: false,
  },
};

function getAgentContext(target: TargetAgent): AgentTemplateContext {
  const context = AGENT_CONTEXTS[target];
  if (!context) {
    throw new Error(`Unsupported agent context: ${target}`);
  }
  return context;
}

function renderForClaude(template: MarkdownTemplate): RenderedCommand {
  const body = renderTemplateBody(template, TargetAgent.CLAUDE_CODE);
  const raw = matter.stringify(body, template.frontmatter);
  return {
    targetRelativePath: template.relativePath,
    format: 'markdown',
    content: normalizeTrailingNewline(raw),
    description: template.frontmatter.description,
  };
}

function renderForCodex(template: MarkdownTemplate): RenderedCommand {
  const body = renderTemplateBody(template, TargetAgent.CODEX_CLI);
  const slug = createCodexPromptSlug(template.relativePath);
  const content = transformCodexMarkdown(template, body);
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
  const body = renderTemplateBody(template, TargetAgent.GEMINI_CLI);
  const prompt = transformGeminiPrompt(template, body);
  const toml = [
    `description = "${escapeTomlString(description)}"`,
    'prompt = """',
    escapeTomlMultiline(prompt),
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

function renderTemplateBody(template: MarkdownTemplate, target: TargetAgent): string {
  if (!template.isHandlebars) {
    return template.body;
  }

  const environment = getHandlebarsEnvironment(template.resourcesRoot);
  const context = buildTemplateContext({
    agent: getAgentContext(target),
    relativePath: template.relativePath,
  });

  const compiled = environment.compile(template.body, { noEscape: true });
  return compiled(context);
}

function createCodexPromptSlug(relativePath: string): string {
  const withoutExt = relativePath.replace(/\.md$/i, '');
  const normalized = withoutExt.replace(/[\\/]+/g, '-');
  const sanitized = normalized.replace(/[^a-zA-Z0-9-]/g, '-').replace(/-+/g, '-');
  const trimmed = sanitized.replace(/^-/, '').replace(/-$/, '') || 'prompt';
  return `${CODEX_PROMPT_PREFIX}${trimmed}`.toLowerCase();
}

function transformCodexMarkdown(template: MarkdownTemplate, markdown: string): string {
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

  let result = processor.stringify(tree).trim();

  const blueprints = template.agentRefs
    .map(agent => renderAgentBlueprintMarkdown(template, agent, TargetAgent.CODEX_CLI, 2))
    .filter((section): section is string => Boolean(section));

  if (blueprints.length > 0) {
    result = `${result}\n\n---\n\n${blueprints.join('\n\n---\n\n')}`;
  }

  return result;
}

function transformGeminiPrompt(template: MarkdownTemplate, markdown: string): string {
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

  let result = processor.stringify(tree).trim();

  const blueprints = template.agentRefs
    .map(agent => renderAgentBlueprintMarkdown(template, agent, TargetAgent.GEMINI_CLI, 3))
    .filter((section): section is string => Boolean(section));

  if (blueprints.length > 0) {
    result = `${result}\n\n---\n\n${blueprints.join('\n\n---\n\n')}`;
  }

  return result;
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

function escapeTomlMultiline(value: string): string {
  return value.replace(/"""/g, '\\"\\"\\"').replace(/\\/g, '\\\\');
}

function renderAgentBlueprintMarkdown(
  template: MarkdownTemplate,
  agentName: string,
  target: TargetAgent,
  baseHeadingDepth: number
): string | null {
  const agentPath = path.join(template.resourcesRoot, 'agents', `${agentName}.md`);
  if (!fs.existsSync(agentPath)) {
    return null;
  }

  const rule = AGENT_RENDER_RULES[target];
  if (!rule || rule.mode === 'skip') {
    return null;
  }

  const raw = fs.readFileSync(agentPath, 'utf8');
  const { data, content } = matter(raw);

  const body = transformAgentBody(content, rule, baseHeadingDepth);

  const displayName = formatAgentDisplayName(agentName);
  const heading = '#'.repeat(baseHeadingDepth);
  const lines: string[] = [`${heading} Agent Blueprint: ${displayName}`];

  if (typeof data.description === 'string') {
    lines.push('', `**Description:** ${data.description}`);
  }

  if (data.tools) {
    const tools = Array.isArray(data.tools) ? data.tools.join(', ') : String(data.tools);
    lines.push(`**Tools:** ${tools}`);
  }

  if (body.length > 0) {
    lines.push('', body);
  }

  let output = lines.join('\n');

  for (const replacement of rule.replacements ?? []) {
    output = output.replace(replacement.pattern, replacement.replace);
  }

  return output;
}

function formatAgentDisplayName(agentName: string): string {
  return agentName
    .replace(/^cm-/, '')
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function transformAgentBody(markdown: string, rule: AgentRenderRule, baseDepth: number): string {
  const processor = unified().use(remarkParse).use(remarkStringify, {
    fence: '`',
    fences: true,
    bullet: '-',
    listItemIndent: 'one',
  });

  const tree = processor.parse(markdown) as Root;

  (rule.dropHeadings ?? []).forEach(pattern => {
    removeSection(tree, heading => pattern.test(getHeadingText(heading)));
  });

  const minDepth = findMinimumHeadingDepth(tree);
  if (minDepth !== null) {
    visit(tree, 'heading', node => {
      const relative = node.depth - minDepth;
      const newDepth = Math.max(1, Math.min(6, baseDepth + relative)) as 1 | 2 | 3 | 4 | 5 | 6;
      node.depth = newDepth;
    });
  }

  return processor.stringify(tree).trim();
}

function findMinimumHeadingDepth(tree: Root): number | null {
  let min: number | null = null;
  visit(tree, 'heading', node => {
    if (min === null || node.depth < min) {
      min = node.depth;
    }
  });
  return min;
}
