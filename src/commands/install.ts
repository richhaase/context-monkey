import { installClaude } from './installers/claude.js';
import { installCodex } from './installers/codex.js';
import { installGemini } from './installers/gemini.js';
import { getTargetLabel } from '../utils/targets.js';
import { InstallOptions, TargetAgent } from '../types/index.js';

export async function install(options: InstallOptions = {}): Promise<void> {
  const targets =
    options.targets && options.targets.length > 0 ? options.targets : [TargetAgent.CLAUDE_CODE];

  const errors: Array<{ target: TargetAgent; error: Error }> = [];

  for (const target of targets) {
    try {
      switch (target) {
        case TargetAgent.CLAUDE_CODE:
          await installClaude({
            local: options.local,
            assumeYes: options.assumeYes,
            skipChecks: Boolean(options._skipExistingCheck),
          });
          break;
        case TargetAgent.CODEX_CLI:
          await installCodex({ assumeYes: options.assumeYes });
          break;
        case TargetAgent.GEMINI_CLI:
          await installGemini({
            assumeYes: options.assumeYes,
            local: options.local,
          });
          break;
        default:
          throw new Error(`Unsupported target agent: ${target}`);
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      errors.push({ target, error: err });
    }
  }

  if (errors.length > 0) {
    console.error('');
    console.error('Some targets failed to install:');
    errors.forEach(item => {
      console.error(`- ${getTargetLabel(item.target)}: ${item.error.message}`);
    });
    throw new Error('Installation encountered errors');
  }
}
