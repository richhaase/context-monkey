import fs from 'fs';
import path from 'path';

import { loadCommandTemplates, loadAgentTemplates } from '../utils/resources.js';

export interface ResourceValidationIssue {
  file: string;
  message: string;
}

export interface ResourceValidationResult {
  ok: boolean;
  issues: ResourceValidationIssue[];
}

interface PartialIndex {
  has(partial: string): boolean;
}

function buildPartialIndex(partialsDir: string): PartialIndex {
  const known = new Set<string>();

  if (!fs.existsSync(partialsDir)) {
    return { has: () => false };
  }

  const stack: string[] = [''];
  while (stack.length > 0) {
    const rel = stack.pop() as string;
    const current = path.join(partialsDir, rel);
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      const nextRel = path.join(rel, entry.name);
      if (entry.isDirectory()) {
        stack.push(nextRel);
      } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.hbs')) {
        const key = nextRel
          .replace(/\\/g, '/')
          .replace(/\.hbs$/i, '')
          .split('/')
          .join('.');
        known.add(key);
      }
    }
  }

  return {
    has(partial: string): boolean {
      return known.has(partial);
    },
  };
}

const PARTIAL_PATTERN = /\{\{\s*>\s*([\w.-]+)[^}]*\}\}/g;

function collectPartials(body: string): string[] {
  const matches: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = PARTIAL_PATTERN.exec(body)) !== null) {
    matches.push(match[1]);
  }
  return matches;
}

export function validateResources(resourcesRoot: string): ResourceValidationResult {
  const issues: ResourceValidationIssue[] = [];

  const commands = loadCommandTemplates(resourcesRoot);
  const agents = loadAgentTemplates(resourcesRoot);
  const partialsDir = path.join(resourcesRoot, 'partials');
  const partialIndex = buildPartialIndex(partialsDir);

  const existingAgentFiles = new Set(agents.map(agent => agent.fileName.replace(/\.md$/i, '')));

  commands.forEach(template => {
    const relative = template.sourceRelativePath;

    if (!template.frontmatter.description || template.frontmatter.description.trim() === '') {
      issues.push({
        file: relative,
        message: 'Missing required frontmatter field: description',
      });
    }

    collectPartials(template.body).forEach(partial => {
      if (!partialIndex.has(partial)) {
        issues.push({
          file: relative,
          message: `References unknown partial '{{> ${partial}}}'`,
        });
      }
    });

    template.agentRefs.forEach(agentRef => {
      if (!existingAgentFiles.has(agentRef)) {
        issues.push({
          file: relative,
          message: `References unknown agent blueprint '${agentRef}'`,
        });
      }
    });
  });

  return {
    ok: issues.length === 0,
    issues,
  };
}
