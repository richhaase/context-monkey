const fs = require('fs');
const path = require('path');
const { isContextMonkeyHook } = require('../config/hooks');

/**
 * Safely load existing settings.json file
 * @param {string} installPath - Path to Claude Code directory
 * @returns {Object} Parsed settings object or default object
 */
function loadSettings(installPath) {
  const settingsPath = path.join(installPath, 'settings.json');
  
  try {
    if (!fs.existsSync(settingsPath)) {
      return {};
    }
    
    const content = fs.readFileSync(settingsPath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.warn(`Warning: Could not parse existing settings.json: ${error.message}`);
    
    // Create backup of malformed file
    const backupPath = path.join(installPath, `settings.json.backup.${Date.now()}`);
    try {
      if (fs.existsSync(settingsPath)) {
        fs.copyFileSync(settingsPath, backupPath);
        console.log(`   Created backup: ${path.basename(backupPath)}`);
      }
    } catch (backupError) {
      console.warn(`   Could not create backup: ${backupError.message}`);
    }
    
    return {};
  }
}

/**
 * Safely merge Context Monkey hooks with existing settings
 * @param {Object} existingSettings - Current settings object
 * @param {Object} contextMonkeyHooks - Hooks to add/update
 * @returns {Object} Merged settings object
 */
function mergeHooks(existingSettings, contextMonkeyHooks) {
  const merged = JSON.parse(JSON.stringify(existingSettings)); // Deep clone
  
  if (!merged.hooks) {
    merged.hooks = {};
  }
  
  // For each hook type (Stop, SubagentStop, Notification)
  Object.keys(contextMonkeyHooks).forEach(hookType => {
    if (!merged.hooks[hookType]) {
      // No existing hooks of this type - add ours
      merged.hooks[hookType] = [...contextMonkeyHooks[hookType]];
    } else {
      // Existing hooks - remove old Context Monkey hooks first, then add new ones
      merged.hooks[hookType] = merged.hooks[hookType].filter(hook => !isContextMonkeyHook(hook));
      merged.hooks[hookType].push(...contextMonkeyHooks[hookType]);
    }
  });
  
  return merged;
}

/**
 * Remove Context Monkey hooks from settings
 * @param {Object} settings - Current settings object
 * @returns {Object} Settings object with Context Monkey hooks removed
 */
function removeContextMonkeyHooks(settings) {
  if (!settings.hooks) {
    return settings;
  }
  
  const cleaned = JSON.parse(JSON.stringify(settings)); // Deep clone
  
  Object.keys(cleaned.hooks).forEach(hookType => {
    if (Array.isArray(cleaned.hooks[hookType])) {
      cleaned.hooks[hookType] = cleaned.hooks[hookType].filter(hook => !isContextMonkeyHook(hook));
      
      // Remove empty hook arrays
      if (cleaned.hooks[hookType].length === 0) {
        delete cleaned.hooks[hookType];
      }
    }
  });
  
  // Remove empty hooks object
  if (Object.keys(cleaned.hooks).length === 0) {
    delete cleaned.hooks;
  }
  
  return cleaned;
}

/**
 * Save settings to settings.json with proper formatting
 * @param {string} installPath - Path to Claude Code directory
 * @param {Object} settings - Settings object to save
 */
function saveSettings(installPath, settings) {
  const settingsPath = path.join(installPath, 'settings.json');
  
  try {
    // Ensure directory exists
    if (!fs.existsSync(installPath)) {
      fs.mkdirSync(installPath, { recursive: true });
    }
    
    const content = JSON.stringify(settings, null, 2);
    fs.writeFileSync(settingsPath, content, 'utf8');
  } catch (error) {
    throw new Error(`Failed to save settings.json: ${error.message}`);
  }
}

/**
 * Count Context Monkey hooks in settings
 * @param {Object} settings - Settings object to analyze
 * @returns {number} Number of Context Monkey hooks found
 */
function countContextMonkeyHooks(settings) {
  if (!settings.hooks) {
    return 0;
  }
  
  let count = 0;
  Object.values(settings.hooks).forEach(hookArray => {
    if (Array.isArray(hookArray)) {
      count += hookArray.filter(hook => isContextMonkeyHook(hook)).length;
    }
  });
  
  return count;
}

/**
 * Validate settings.json structure
 * @param {Object} settings - Settings object to validate
 * @returns {Object} Validation result with isValid boolean and issues array
 */
function validateSettings(settings) {
  const issues = [];
  let isValid = true;
  
  try {
    if (typeof settings !== 'object' || settings === null) {
      issues.push('Settings must be an object');
      isValid = false;
    }
    
    if (settings.hooks && typeof settings.hooks !== 'object') {
      issues.push('hooks property must be an object');
      isValid = false;
    }
    
    if (settings.hooks) {
      Object.entries(settings.hooks).forEach(([hookType, hookArray]) => {
        if (!Array.isArray(hookArray)) {
          issues.push(`hooks.${hookType} must be an array`);
          isValid = false;
        }
      });
    }
    
  } catch (error) {
    issues.push(`Validation error: ${error.message}`);
    isValid = false;
  }
  
  return { isValid, issues };
}

module.exports = {
  loadSettings,
  mergeHooks,
  removeContextMonkeyHooks,
  saveSettings,
  countContextMonkeyHooks,
  validateSettings
};