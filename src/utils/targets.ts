import fs from 'fs';
import os from 'os';
import path from 'path';
import { spawnSync } from 'child_process';

import { TargetAgent } from '../types/index.js';
import { CODEX_LEGACY_PROMPT_PREFIXES } from './codex.js';

export interface AgentStatus {
  agent: TargetAgent;
  label: string;
  available: boolean;
  installed: boolean;
  details: string[];
}

const TARGET_LABELS: Record<TargetAgent, string> = {
  [TargetAgent.CLAUDE_CODE]: 'Claude Code',
  [TargetAgent.CODEX_CLI]: 'Codex CLI',
  [TargetAgent.GEMINI_CLI]: 'Gemini CLI',
};

export function getTargetLabel(target: TargetAgent): string {
  return TARGET_LABELS[target] ?? target;
}

export function detectAgentStatuses(): AgentStatus[] {
  return [detectClaudeStatus(), detectCodexStatus(), detectGeminiStatus()];
}

function detectClaudeStatus(): AgentStatus {
  const globalCommandsDir = path.join(os.homedir(), '.claude', 'commands', 'cm');
  const installed = directoryHasFiles(globalCommandsDir);

  const details: string[] = [];
  if (installed) {
    details.push(`Commands: ${shortenPath(globalCommandsDir)}`);
  }

  return {
    agent: TargetAgent.CLAUDE_CODE,
    label: TARGET_LABELS[TargetAgent.CLAUDE_CODE],
    available: true,
    installed,
    details,
  };
}

function detectCodexStatus(): AgentStatus {
  const promptsDir = path.join(os.homedir(), '.codex', 'prompts');
  const available = commandExists('codex');
  const promptFiles = listFiles(promptsDir).filter(file =>
    CODEX_LEGACY_PROMPT_PREFIXES.some(prefix => file.startsWith(prefix))
  );
  const installed = promptFiles.length > 0;

  const details: string[] = [];
  if (installed) {
    details.push(`Prompts: ${shortenPath(promptsDir)}`);
  } else if (available) {
    details.push('No Context Monkey prompts detected');
  }

  return {
    agent: TargetAgent.CODEX_CLI,
    label: TARGET_LABELS[TargetAgent.CODEX_CLI],
    available,
    installed,
    details,
  };
}

function detectGeminiStatus(): AgentStatus {
  const baseDir = path.join(os.homedir(), '.gemini');
  const commandsDir = path.join(baseDir, 'commands');
  const cmCommandsDir = path.join(commandsDir, 'cm');
  const extensionDir = path.join(baseDir, 'extensions', 'cm');

  const available = commandExists('gemini');
  const installed = directoryHasFiles(cmCommandsDir) || directoryHasFiles(extensionDir);

  const details: string[] = [];
  if (installed) {
    details.push(`Commands: ${shortenPath(cmCommandsDir)}`);
    if (fs.existsSync(extensionDir)) {
      details.push(`Extension: ${shortenPath(extensionDir)}`);
    }
  } else if (available) {
    details.push('No Context Monkey commands detected');
  }

  return {
    agent: TargetAgent.GEMINI_CLI,
    label: TARGET_LABELS[TargetAgent.GEMINI_CLI],
    available,
    installed,
    details,
  };
}

function commandExists(command: string): boolean {
  const which = process.platform === 'win32' ? 'where' : 'which';
  const result = spawnSync(which, [command], { stdio: 'ignore' });
  return result.status === 0;
}

function directoryHasFiles(dir: string): boolean {
  if (!fs.existsSync(dir)) {
    return false;
  }
  try {
    const entries = fs.readdirSync(dir);
    return entries.length > 0;
  } catch {
    return false;
  }
}

function listFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) {
    return [];
  }
  try {
    return fs.readdirSync(dir);
  } catch {
    return [];
  }
}

function shortenPath(p: string): string {
  return p.replace(os.homedir(), '~');
}
