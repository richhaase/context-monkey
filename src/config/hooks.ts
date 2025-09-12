import { HookConfig, HookDefinition } from '../types/index.js';

/**
 * Hook configuration definitions for Context Monkey
 */
export const HOOK_CONFIGS: Record<string, HookConfig> = {
  stop: {
    title: '🤖 Claude Code',
    message: '✅ Agent finished in {dir}',
    sound: 'Hero',
  },
  subagentStop: {
    title: '🔧 Claude Code',
    message: '🎯 Subagent finished in {dir}',
    sound: 'Ping',
  },
  notification: {
    title: '⚠️ Claude Code',
    message: '💬 Attention needed in {dir}',
    sound: 'Glass',
  },
};

/**
 * Context Monkey hook identifier to distinguish our hooks from user hooks
 */
export const CONTEXT_MONKEY_MARKER = '__context_monkey_hook__';

/**
 * Generate hook configurations for terminal-notifier
 * @param hookConfigs - Hook configuration object
 * @returns Claude Code hooks configuration
 */
export function generateHooks(
  hookConfigs: Record<string, HookConfig> = HOOK_CONFIGS
): Record<string, HookDefinition[]> {
  return {
    Stop: [createTerminalNotifierHook(hookConfigs.stop)],
    SubagentStop: [createTerminalNotifierHook(hookConfigs.subagentStop)],
    Notification: [createTerminalNotifierHook(hookConfigs.notification)],
  };
}

/**
 * Create a terminal-notifier hook configuration
 * @param config - Hook configuration
 * @returns Hook configuration for Claude Code settings
 */
export function createTerminalNotifierHook(config: HookConfig): HookDefinition {
  const command = `dir=$(basename "$CLAUDE_PROJECT_DIR"); terminal-notifier -title '${config.title}' -message "${config.message.replace('{dir}', '$dir')}" -sound ${config.sound}`;

  return {
    matcher: '',
    hooks: [
      {
        type: 'command',
        command: command,
        timeout: 10,
        [CONTEXT_MONKEY_MARKER]: true, // Mark as Context Monkey hook
      },
    ],
  };
}

/**
 * Check if a hook was created by Context Monkey
 * @param hook - Hook object to check
 * @returns true if hook was created by Context Monkey
 */
export function isContextMonkeyHook(hook: HookDefinition): boolean {
  if (hook && hook.hooks) {
    return hook.hooks.some(h => h[CONTEXT_MONKEY_MARKER] === true);
  }
  return false;
}
