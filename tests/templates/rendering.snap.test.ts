import { describe, expect, test } from 'bun:test';
import path from 'path';
import fs from 'fs';

import { loadCommandTemplates } from '../../src/utils/resources';
import { renderCommandForTarget } from '../../src/templates/index';
import { TargetAgent } from '../../src/types';

const resourcesDir = path.join(process.cwd(), 'resources');
const snapshotsDir = path.join(process.cwd(), 'tests', 'snapshots');

const templates = loadCommandTemplates(resourcesDir);
const SNAPSHOT_TEMPLATES = new Set(['docs.md', 'stack-scan.md', 'plan.md', 'explain-repo.md']);
const snapshotTemplates = templates.filter(template =>
  SNAPSHOT_TEMPLATES.has(template.relativePath)
);

function snapshotPath(agent: string, relative: string): string {
  return path.join(snapshotsDir, agent, relative);
}

describe('command rendering snapshots', () => {
  test('Claude snapshots are stable', () => {
    for (const template of snapshotTemplates) {
      const rendered = renderCommandForTarget(template, TargetAgent.CLAUDE_CODE);
      const expectedPath = snapshotPath('claude', rendered.targetRelativePath);
      const expected = fs.readFileSync(expectedPath, 'utf8');
      expect(rendered.content).toBe(expected);
    }
  });

  test('Codex snapshots are stable', () => {
    for (const template of snapshotTemplates) {
      const rendered = renderCommandForTarget(template, TargetAgent.CODEX_CLI);
      const expectedPath = snapshotPath('codex', rendered.targetRelativePath);
      const expected = fs.readFileSync(expectedPath, 'utf8');
      expect(rendered.content).toBe(expected);
    }
  });

  test('Gemini snapshots are stable', () => {
    for (const template of snapshotTemplates) {
      const rendered = renderCommandForTarget(template, TargetAgent.GEMINI_CLI);
      const expectedPath = snapshotPath('gemini', rendered.targetRelativePath);
      const expected = fs.readFileSync(expectedPath, 'utf8');
      expect(rendered.content).toBe(expected);
    }
  });
});
