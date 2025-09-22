import fs from 'fs-extra';
import path from 'path';

const root = path.resolve(process.cwd());
const resourcesDir = path.join(root, 'resources');
const distDir = path.join(root, 'dist');

const { loadCommandTemplates } = await import(path.join(distDir, 'utils/resources.js'));
const { renderCommandForTarget } = await import(path.join(distDir, 'templates/index.js'));
const { TargetAgent } = await import(path.join(distDir, 'types/index.js'));

const templates = loadCommandTemplates(resourcesDir);
const SNAPSHOT_TEMPLATES = new Set([
  'docs.md',
  'stack-scan.md',
  'plan.md',
  'explain-repo.md',
]);

async function main() {
  const outputRoot = path.join(root, 'tests', 'snapshots');

  await Promise.all([
    writeAgentSnapshots(outputRoot, 'claude', templates, TargetAgent.CLAUDE_CODE),
    writeAgentSnapshots(outputRoot, 'codex', templates, TargetAgent.CODEX_CLI),
    writeAgentSnapshots(outputRoot, 'gemini', templates, TargetAgent.GEMINI_CLI),
  ]);

  console.log('Snapshots generated at tests/snapshots');
}

async function writeAgentSnapshots(outputRoot, agentFolder, templates, agent) {
  const agentDir = path.join(outputRoot, agentFolder);
  await fs.ensureDir(agentDir);

  for (const template of templates) {
    if (!SNAPSHOT_TEMPLATES.has(template.relativePath)) {
      continue;
    }
    const rendered = renderCommandForTarget(template, agent);
    const outputPath = path.join(agentDir, rendered.targetRelativePath);
    await fs.ensureDir(path.dirname(outputPath));
    await fs.writeFile(outputPath, rendered.content, 'utf8');
  }
}

main().catch(error => {
  console.error('Snapshot generation failed:', error);
  process.exitCode = 1;
});
