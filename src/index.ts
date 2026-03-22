#!/usr/bin/env bun

import { Command } from "commander";
import pkg from "../package.json";
import { registerDiff } from "./commands/diff.ts";
import { registerScan } from "./commands/scan.ts";
import { registerSync } from "./commands/sync.ts";

const program = new Command()
  .name("cm")
  .description("Make AI agent harness configurations portable")
  .version(pkg.version, "-v, --version");

registerScan(program);
registerDiff(program);
registerSync(program);

// Default to scan when no command given
program.action(async () => {
  await program.commands.find((c) => c.name() === "scan")?.parseAsync(["scan"], { from: "user" });
});

program.parseAsync(process.argv).catch((err: Error) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
