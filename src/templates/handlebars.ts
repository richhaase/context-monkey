import fs from 'fs';
import path from 'path';
import Handlebars from 'handlebars';

const envCache = new Map<string, typeof Handlebars>();

export interface AgentTemplateContext {
  id: string;
  name: string;
  supportsSubagents: boolean;
}

export interface TemplateContext {
  agent: AgentTemplateContext;
  command: {
    id: string;
    relativePath: string;
  };
  features: Record<string, unknown>;
}

export function getHandlebarsEnvironment(resourcesRoot: string): typeof Handlebars {
  const resolvedRoot = path.resolve(resourcesRoot);
  const cached = envCache.get(resolvedRoot);
  if (cached) {
    return cached;
  }

  const instance = Handlebars.create();
  registerPartials(instance, path.join(resolvedRoot, 'partials'));
  registerHelpers(instance);

  envCache.set(resolvedRoot, instance);
  return instance;
}

function registerHelpers(instance: typeof Handlebars): void {
  // Placeholder for future helpers. Keeps API explicit.
  instance.registerHelper('noop', value => value);
  instance.registerHelper('eq', (a, b) => a === b);
}

function registerPartials(instance: typeof Handlebars, partialsDir: string): void {
  if (!fs.existsSync(partialsDir)) {
    return;
  }

  const stack: string[] = [''];
  while (stack.length > 0) {
    const relative = stack.pop() as string;
    const currentDir = path.join(partialsDir, relative);
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const entryRelative = path.join(relative, entry.name);
      const entryPath = path.join(partialsDir, entryRelative);
      if (entry.isDirectory()) {
        stack.push(entryRelative);
      } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.hbs')) {
        const partialName = entryRelative
          .replace(/\\/g, '/')
          .replace(/\.hbs$/i, '')
          .split('/')
          .join('.');
        const template = fs.readFileSync(entryPath, 'utf8');
        instance.registerPartial(partialName, template);
      }
    }
  }
}

export function buildTemplateContext(params: {
  agent: AgentTemplateContext;
  relativePath: string;
}): TemplateContext {
  return {
    agent: params.agent,
    command: {
      id: params.relativePath.replace(/\.md$/i, ''),
      relativePath: params.relativePath,
    },
    features: {},
  };
}
