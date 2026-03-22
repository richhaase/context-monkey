import type { HarnessContext, HarnessId } from "../model/context.ts";

export interface Scanner {
  id: HarnessId;
  displayName: string;
  detect(root: string): Promise<boolean>;
  scan(root: string): Promise<HarnessContext>;
}
