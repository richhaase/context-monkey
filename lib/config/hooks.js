/**
 * Hook configuration definitions for Context Monkey
 */

const HOOK_CONFIGS = {
  stop: {
    title: '🤖 Claude Code',
    message: '✅ Agent finished in {dir}',
    sound: 'Hero'
  },
  subagentStop: {
    title: '🔧 Claude Code', 
    message: '🎯 Subagent finished in {dir}',
    sound: 'Ping'
  },
  notification: {
    title: '⚠️ Claude Code',
    message: '💬 Attention needed in {dir}',
    sound: 'Glass'
  }
};

/**
 * Context Monkey hook identifier to distinguish our hooks from user hooks
 */
const CONTEXT_MONKEY_MARKER = '__context_monkey_hook__';

/**
 * Generate hook configurations for terminal-notifier
 * @param {Object} hookConfigs - Hook configuration object
 * @returns {Object} Claude Code hooks configuration
 */
function generateHooks(hookConfigs = HOOK_CONFIGS) {
  return {
    "Stop": [createTerminalNotifierHook(hookConfigs.stop)],
    "SubagentStop": [createTerminalNotifierHook(hookConfigs.subagentStop)],
    "Notification": [createTerminalNotifierHook(hookConfigs.notification)]
  };
}

/**
 * Create a terminal-notifier hook configuration
 * @param {Object} config - Hook configuration
 * @returns {Object} Hook configuration for Claude Code settings
 */
function createTerminalNotifierHook(config) {
  const command = `dir=$(basename "$CLAUDE_PROJECT_DIR"); terminal-notifier -title '${config.title}' -message "${config.message.replace('{dir}', '$dir')}" -sound ${config.sound}`;
  
  return {
    matcher: "",
    hooks: [{
      type: "command",
      command: command,
      timeout: 10,
      [CONTEXT_MONKEY_MARKER]: true  // Mark as Context Monkey hook
    }]
  };
}

/**
 * Check if a hook was created by Context Monkey
 * @param {Object} hook - Hook object to check
 * @returns {boolean} true if hook was created by Context Monkey
 */
function isContextMonkeyHook(hook) {
  if (hook && hook.hooks) {
    return hook.hooks.some(h => h[CONTEXT_MONKEY_MARKER] === true);
  }
  return false;
}

module.exports = {
  HOOK_CONFIGS,
  CONTEXT_MONKEY_MARKER,
  generateHooks,
  createTerminalNotifierHook,
  isContextMonkeyHook
};