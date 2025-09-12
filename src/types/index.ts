// Core type definitions for Context Monkey

export interface InstallOptions {
  local?: boolean;
  assumeYes?: boolean;
  _skipExistingCheck?: boolean;
}

export interface UninstallOptions {
  local?: boolean;
  assumeYes?: boolean;
}

export interface PlatformInfo {
  platform: string;
  supportsNotifications: boolean;
  requirements: string;
  notificationMethod: string | null;
}

export interface HookConfig {
  title: string;
  message: string;
  sound: string;
}

export interface ClaudeSettings {
  model?: string;
  hooks?: Record<string, HookDefinition[]>;
  [key: string]: unknown;
}

export interface HookDefinition {
  matcher: string;
  hooks: Array<{
    type: string;
    command: string;
    timeout: number;
    __context_monkey_hook__?: boolean;
  }>;
}

export interface Hook {
  type: string;
  command: string;
  timeout: number;
  __context_monkey_hook__?: boolean;
}

export interface FileStats {
  exists: boolean;
  isDirectory: boolean;
  size?: number;
}

export interface ValidationResult {
  isValid: boolean;
  issues: string[];
}
