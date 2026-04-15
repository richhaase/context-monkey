import type { ContextEntry, HarnessId } from "../model/context.ts";

export interface SyncAction {
  type: "create" | "update" | "skip";
  path: string;
  content?: string;
  entry: ContextEntry;
  existing?: string;
  reason?: string;
}

export interface SyncPlan {
  source: HarnessId;
  target: HarnessId;
  actions: SyncAction[];
}

export interface Writer {
  id: HarnessId;
  displayName: string;
  plan(entries: ContextEntry[], workspaceRoot?: string): Promise<SyncPlan>;
  execute(plan: SyncPlan): Promise<void>;
}
