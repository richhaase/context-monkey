import { uninstallClaude } from './uninstallers/claude.js';
import { uninstallCodex } from './uninstallers/codex.js';
import { uninstallGemini } from './uninstallers/gemini.js';
import { getTargetLabel } from '../utils/targets.js';
import { TargetAgent, UninstallOptions } from '../types/index.js';

export async function uninstall(options: UninstallOptions = {}): Promise<void> {
  const targets =
    options.targets && options.targets.length > 0 ? options.targets : [TargetAgent.CLAUDE_CODE];

  const errors: Array<{ target: TargetAgent; error: Error }> = [];

  for (const target of targets) {
    try {
      switch (target) {
        case TargetAgent.CLAUDE_CODE:
          await uninstallClaude({
            local: options.local,
            assumeYes: options.assumeYes,
          });
          break;
        case TargetAgent.CODEX_CLI:
          await uninstallCodex();
          break;
        case TargetAgent.GEMINI_CLI:
          await uninstallGemini({
            assumeYes: options.assumeYes,
            local: options.local,
          });
          break;
        default:
          throw new Error(`Unsupported target agent: ${target}`);
      }
    } catch (error) {
      errors.push({
        target,
        error: error instanceof Error ? error : new Error(String(error)),
      });
    }
  }

  if (errors.length > 0) {
    console.error('');
    console.error('Some targets failed to uninstall:');
    errors.forEach(item => {
      console.error(`- ${getTargetLabel(item.target)}: ${item.error.message}`);
    });
    throw new Error('Uninstall encountered errors');
  }
}
