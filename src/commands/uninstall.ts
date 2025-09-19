import { uninstallClaude } from './uninstallers/claude.js';
import { uninstallCodex } from './uninstallers/codex.js';
import { uninstallGemini } from './uninstallers/gemini.js';
import { askQuestion } from '../utils/prompt.js';
import { detectAgentStatuses, getTargetLabel, type AgentStatus } from '../utils/targets.js';
import { TargetAgent } from '../types/index.js';

export async function uninstall(): Promise<void> {
  const statuses = detectAgentStatuses();
  const installed = statuses.filter(status => status.installed);

  if (installed.length === 0) {
    console.log('Context Monkey is not installed for any supported agent.');
    return;
  }

  printAgentOverview(statuses, 'Detected agent environments');

  const selected = await promptAgentSelection(installed, 'uninstall');
  if (selected.length === 0) {
    console.log('No agents selected. Aborting uninstall.');
    return;
  }

  const confirm = await confirmSelection(selected, 'Remove Context Monkey from');
  if (!confirm) {
    console.log('Uninstall cancelled.');
    return;
  }

  const errors: Array<{ target: TargetAgent; error: Error }> = [];

  for (const status of selected) {
    console.log('');
    console.log(`=== ${getTargetLabel(status.agent)} ===`);

    try {
      switch (status.agent) {
        case TargetAgent.CLAUDE_CODE:
          await uninstallClaude();
          break;
        case TargetAgent.CODEX_CLI:
          await uninstallCodex();
          break;
        case TargetAgent.GEMINI_CLI:
          await uninstallGemini();
          break;
        default:
          throw new Error(`Unsupported agent: ${status.agent}`);
      }
    } catch (error) {
      errors.push({
        target: status.agent,
        error: error instanceof Error ? error : new Error(String(error)),
      });
    }
  }

  if (errors.length > 0) {
    console.error('');
    console.error('Some agents encountered errors:');
    errors.forEach(({ target, error }) => {
      console.error(`- ${getTargetLabel(target)}: ${error.message}`);
    });
    throw new Error('Uninstall encountered errors');
  }

  console.log('');
  console.log('🧹 Context Monkey removed from selected agents.');
}

function printAgentOverview(statuses: AgentStatus[], title: string): void {
  console.log('');
  console.log(title);
  statuses.forEach((status, index) => {
    const availability = status.available ? 'available' : 'not detected';
    const state = status.available
      ? status.installed
        ? 'Context Monkey already installed'
        : 'Context Monkey not installed'
      : 'Install the CLI to enable installation';

    console.log(`  [${index + 1}] ${status.label} — ${state} (${availability})`);
    status.details.forEach(detail => {
      console.log(`      • ${detail}`);
    });
  });
  console.log('');
}

async function promptAgentSelection(
  options: AgentStatus[],
  actionDescription: string
): Promise<AgentStatus[]> {
  if (options.length === 1) {
    const answer = await askQuestion(`${options[0].label}: ${actionDescription} now? [Y/n] `);
    if (answer === '' || answer === 'y' || answer === 'yes') {
      return options;
    }
    return [];
  }

  while (true) {
    const answer = await askQuestion(
      `Select agents to ${actionDescription} (numbers separated by commas, 'all' for every match, or press Enter to cancel): `
    );

    if (answer === '') {
      return [];
    }

    if (answer === 'all' || answer === '*') {
      return options;
    }

    const parts = answer
      .split(/[,\s]+/)
      .map(part => part.trim())
      .filter(Boolean);

    const indices = new Set<number>();
    let valid = true;
    for (const part of parts) {
      const idx = Number.parseInt(part, 10);
      if (Number.isNaN(idx) || idx < 1 || idx > options.length) {
        valid = false;
        break;
      }
      indices.add(idx - 1);
    }

    if (!valid || indices.size === 0) {
      console.log('Please enter valid option numbers. Example: 1,3 or all');
      continue;
    }

    return Array.from(indices).map(index => options[index]);
  }
}

async function confirmSelection(statuses: AgentStatus[], action: string): Promise<boolean> {
  console.log('');
  console.log(`${action}:`);
  statuses.forEach(status => {
    console.log(`  • ${status.label}`);
  });
  console.log('');
  const answer = await askQuestion('Proceed? [Y/n] ');
  return answer === '' || answer === 'y' || answer === 'yes';
}
