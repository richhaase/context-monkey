import { describe, expect, test } from 'bun:test';
import path from 'path';
import os from 'os';
import fs from 'fs-extra';

import { validateResources } from '../../src/scripts/resourceValidation';

describe('resource validation', () => {
  test('passes for current resources directory', () => {
    const resourcesDir = path.join(process.cwd(), 'resources');
    const result = validateResources(resourcesDir);
    expect(result.ok).toBe(true);
    expect(result.issues.length).toBe(0);
  });

  test('reports issues for invalid templates', async () => {
    const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'cm-validate-'));
    try {
      const commandsDir = path.join(tempRoot, 'commands');
      const partialsDir = path.join(tempRoot, 'partials');
      await fs.ensureDir(commandsDir);
      await fs.ensureDir(partialsDir);

      const badTemplate = ['---', '---', 'Body content', '', '{{> insert.missingPartial}}'].join(
        '\n'
      );
      await fs.writeFile(path.join(commandsDir, 'bad.md.hbs'), badTemplate, 'utf8');

      const result = validateResources(tempRoot);
      expect(result.ok).toBe(false);
      const messages = result.issues.map(issue => issue.message);
      expect(messages.some(message => message.includes('description'))).toBe(true);
      expect(messages.some(message => message.includes('unknown partial'))).toBe(true);
    } finally {
      await fs.remove(tempRoot);
    }
  });
});
