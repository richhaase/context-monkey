import type { HarnessContext, HarnessId } from "../model/context.ts";

export interface Scanner {
  id: HarnessId;
  displayName: string;
  detect(): Promise<boolean>;
  scan(): Promise<HarnessContext>;
}
