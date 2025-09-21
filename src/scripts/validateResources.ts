import path from 'path';

import { validateResources } from './resourceValidation.js';

function main(): void {
  const resourcesDir = path.join(import.meta.dirname, '../../resources');
  const result = validateResources(resourcesDir);

  if (!result.ok) {
    console.error('Resource validation failed:');
    for (const issue of result.issues) {
      console.error(`- ${issue.file}: ${issue.message}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log('✅ Resource validation passed');
}

main();
