import { describe, expect, test, beforeEach, afterEach, vi } from 'bun:test';
import fs from 'fs';
import path from 'path';
import os from 'os';

import { getHandlebarsEnvironment, buildTemplateContext } from '../../src/templates/handlebars';
import { TargetAgent } from '../../src/types/index';

describe('handlebars utilities', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cm-hbs-test-'));
    const partialsDir = path.join(tempDir, 'partials', 'nested');
    fs.mkdirSync(partialsDir, { recursive: true });
    fs.writeFileSync(path.join(partialsDir, 'greeting.hbs'), 'Hello {{noop agent.name}}!', 'utf8');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  test('getHandlebarsEnvironment registers helpers and partials', () => {
    const env = getHandlebarsEnvironment(tempDir);
    const template = env.compile('{{> nested.greeting}}');

    const context = buildTemplateContext({
      agent: {
        id: TargetAgent.CLAUDE_CODE,
        name: 'Claude',
        supportsSubagents: true,
      },
      relativePath: 'commands/example.md',
    });

    const output = template(context);
    expect(output).toBe('Hello Claude!');
  });

  test('getHandlebarsEnvironment caches environments per resolved root', () => {
    const spy = vi.spyOn(fs, 'readdirSync');

    getHandlebarsEnvironment(tempDir);
    const firstCallCount = spy.mock.calls.length;

    getHandlebarsEnvironment(tempDir);
    expect(spy.mock.calls.length).toBe(firstCallCount);
  });
});
