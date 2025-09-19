import { installClaude } from './installers/claude.js';
import { installCodex } from './installers/codex.js';
import { installGemini } from './installers/gemini.js';
import { askQuestion } from '../utils/prompt.js';
import { detectAgentStatuses, getTargetLabel, type AgentStatus } from '../utils/targets.js';
import { TargetAgent } from '../types/index.js';

export async function install(): Promise<void> {
  const statuses = detectAgentStatuses();
  const available = statuses.filter(status => status.available);

  if (available.length === 0) {
    console.log(
      'No supported agent CLIs detected. Install Codex CLI or Gemini CLI to enable integration.'
    );
    return;
  }

  printAgentOverview(statuses, 'Detected agent environments');

  const selectedAgents = await promptAgentSelection(available, 'install or update');
  if (selectedAgents.length === 0) {
    console.log('No agents selected. Aborting installation.');
    return;
  }

  const confirm = await confirmSelection(selectedAgents, 'Install Context Monkey for');
  if (!confirm) {
    console.log('Installation cancelled.');
    return;
  }

  const errors: Array<{ target: TargetAgent; error: Error }> = [];

  for (const status of selectedAgents) {
    console.log('');
    console.log(`=== ${getTargetLabel(status.agent)} ===`);

    try {
      switch (status.agent) {
        case TargetAgent.CLAUDE_CODE:
          await installClaude();
          break;
        case TargetAgent.CODEX_CLI:
          await installCodex();
          break;
        case TargetAgent.GEMINI_CLI:
          await installGemini();
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
    throw new Error('Installation encountered errors');
  }

  console.log('');
  console.log('🎉 Context Monkey setup complete!');
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
    const answer = await askQuestion(`${options[0].label} is available. Install now? [Y/n] `);
    if (answer === '' || answer === 'y' || answer === 'yes') {
      return options;
    }
    return [];
  }

  while (true) {
    const answer = await askQuestion(
      `Select agents to ${actionDescription} (numbers separated by commas, 'all' for every available agent, or press Enter to cancel): `
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
