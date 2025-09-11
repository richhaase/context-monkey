import fs from 'fs';
import path from 'path';
import { ClaudeSettings, HookDefinition, ValidationResult } from '../types/index.js';
import { isContextMonkeyHook } from '../config/hooks.js';

/**
 * Safely load existing settings.json file
 * @param installPath - Path to Claude Code directory
 * @returns Parsed settings object or default object
 */
export function loadSettings(installPath: string): ClaudeSettings {
  const settingsPath = path.join(installPath, 'settings.json');
  
  try {
    if (!fs.existsSync(settingsPath)) {
      return {};
    }
    
    const content = fs.readFileSync(settingsPath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.warn(`Warning: Could not parse existing settings.json: ${errorMessage}`);
    
    // Create backup of malformed file
    const backupPath = path.join(installPath, `settings.json.backup.${Date.now()}`);
    try {
      if (fs.existsSync(settingsPath)) {
        fs.copyFileSync(settingsPath, backupPath);
        console.log(`   Created backup: ${path.basename(backupPath)}`);
      }
    } catch (backupError) {
      const backupMessage = backupError instanceof Error ? backupError.message : 'Unknown backup error';
      console.warn(`   Could not create backup: ${backupMessage}`);
    }
    
    return {};
  }
}

/**
 * Safely merge Context Monkey hooks with existing settings
 * @param existingSettings - Current settings object
 * @param contextMonkeyHooks - Hooks to add/update
 * @returns Merged settings object
 */
export function mergeHooks(
  existingSettings: ClaudeSettings, 
  contextMonkeyHooks: Record<string, HookDefinition[]>
): ClaudeSettings {
  const merged = JSON.parse(JSON.stringify(existingSettings)) as ClaudeSettings; // Deep clone
  
  if (!merged.hooks) {
    merged.hooks = {};
  }
  
  // For each hook type (Stop, SubagentStop, Notification)
  Object.keys(contextMonkeyHooks).forEach(hookType => {
    if (!merged.hooks![hookType]) {
      // No existing hooks of this type - add ours
      merged.hooks![hookType] = [...contextMonkeyHooks[hookType]];
    } else {
      // Existing hooks - remove old Context Monkey hooks first, then add new ones
      merged.hooks![hookType] = merged.hooks![hookType].filter(hook => !isContextMonkeyHook(hook));
      merged.hooks![hookType].push(...contextMonkeyHooks[hookType]);
    }
  });
  
  return merged;
}

/**
 * Remove Context Monkey hooks from settings
 * @param settings - Current settings object
 * @returns Settings object with Context Monkey hooks removed
 */
export function removeContextMonkeyHooks(settings: ClaudeSettings): ClaudeSettings {
  if (!settings.hooks) {
    return settings;
  }
  
  const cleaned = JSON.parse(JSON.stringify(settings)) as ClaudeSettings; // Deep clone
  
  Object.keys(cleaned.hooks!).forEach(hookType => {
    if (Array.isArray(cleaned.hooks![hookType])) {
      cleaned.hooks![hookType] = cleaned.hooks![hookType].filter(hook => !isContextMonkeyHook(hook));
      
      // Remove empty hook arrays
      if (cleaned.hooks![hookType].length === 0) {
        delete cleaned.hooks![hookType];
      }
    }
  });
  
  // Remove empty hooks object
  if (Object.keys(cleaned.hooks!).length === 0) {
    delete cleaned.hooks;
  }
  
  return cleaned;
}

/**
 * Save settings to settings.json with proper formatting
 * @param installPath - Path to Claude Code directory
 * @param settings - Settings object to save
 */
export function saveSettings(installPath: string, settings: ClaudeSettings): void {
  const settingsPath = path.join(installPath, 'settings.json');
  
  try {
    // Ensure directory exists
    if (!fs.existsSync(installPath)) {
      fs.mkdirSync(installPath, { recursive: true });
    }
    
    const content = JSON.stringify(settings, null, 2);
    fs.writeFileSync(settingsPath, content, 'utf8');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to save settings.json: ${errorMessage}`);
  }
}

/**
 * Count Context Monkey hooks in settings
 * @param settings - Settings object to analyze
 * @returns Number of Context Monkey hooks found
 */
export function countContextMonkeyHooks(settings: ClaudeSettings): number {
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
 * @param settings - Settings object to validate
 * @returns Validation result with isValid boolean and issues array
 */
export function validateSettings(settings: unknown): ValidationResult {
  const issues: string[] = [];
  let isValid = true;
  
  try {
    if (typeof settings !== 'object' || settings === null) {
      issues.push('Settings must be an object');
      isValid = false;
    }
    
    const settingsObj = settings as Record<string, unknown>;
    
    if (settingsObj.hooks && typeof settingsObj.hooks !== 'object') {
      issues.push('hooks property must be an object');
      isValid = false;
    }
    
    if (settingsObj.hooks) {
      const hooks = settingsObj.hooks as Record<string, unknown>;
      Object.entries(hooks).forEach(([hookType, hookArray]) => {
        if (!Array.isArray(hookArray)) {
          issues.push(`hooks.${hookType} must be an array`);
          isValid = false;
        }
      });
    }
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown validation error';
    issues.push(`Validation error: ${errorMessage}`);
    isValid = false;
  }
  
  return { isValid, issues };
}