import type { HarnessContext, HarnessId } from "../model/context.ts";

export interface Scanner {
  id: HarnessId;
  displayName: string;
  detect(workspaceRoot?: string): Promise<boolean>;
  scan(workspaceRoot?: string): Promise<HarnessContext>;
}
