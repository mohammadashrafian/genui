import * as fs from 'node:fs';
import * as path from 'node:path';
import prompts from 'prompts';
import {
  type AdapterChoice,
  generateRegistryTemplate,
  getAdapterChoices,
  getDependencies,
} from '../templates/registry.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function log(message: string): void {
  console.log(message);
}

function logError(message: string): void {
  console.error(`\x1b[31m${message}\x1b[0m`);
}

/**
 * Ensure the target directory exists, creating intermediate directories as
 * needed. Returns `true` on success, `false` if creation failed.
 */
function ensureDirectory(dirPath: string): boolean {
  try {
    fs.mkdirSync(dirPath, { recursive: true });
    return true;
  } catch {
    logError(`Error: could not create directory "${dirPath}".`);
    return false;
  }
}

// ---------------------------------------------------------------------------
// init command
// ---------------------------------------------------------------------------

export async function initCommand(): Promise<void> {
  log('');
  log('\x1b[1m\x1b[36m  GenUI \x1b[0m\x1b[1m— Initialize Component Registry\x1b[0m');
  log('');

  const adapterChoices = getAdapterChoices();

  const response = await prompts(
    [
      {
        type: 'select',
        name: 'adapter',
        message: 'Select your UI adapter',
        choices: adapterChoices.map((a) => ({ title: a, value: a })),
      },
      {
        type: 'text',
        name: 'outDir',
        message: 'Output directory',
        initial: 'src/lib',
      },
    ],
    {
      onCancel: () => {
        log('');
        log('Cancelled.');
        process.exit(0);
      },
    },
  );

  const adapter = response.adapter as AdapterChoice;
  const outDir = (response.outDir as string).trim() || 'src/lib';

  // Resolve output path relative to cwd
  const resolvedDir = path.resolve(process.cwd(), outDir);
  const filePath = path.join(resolvedDir, 'registry.ts');

  // Check for existing file
  if (fs.existsSync(filePath)) {
    const overwrite = await prompts(
      {
        type: 'confirm',
        name: 'value',
        message: `registry.ts already exists at ${filePath}. Overwrite?`,
        initial: false,
      },
      {
        onCancel: () => {
          log('');
          log('Cancelled.');
          process.exit(0);
        },
      },
    );

    if (!overwrite.value) {
      log('');
      log('Aborted — existing file was not modified.');
      return;
    }
  }

  // Create directory if needed
  if (!ensureDirectory(resolvedDir)) {
    process.exitCode = 1;
    return;
  }

  // Write the registry file
  const template = generateRegistryTemplate(adapter);
  try {
    fs.writeFileSync(filePath, template, 'utf-8');
  } catch {
    logError(`Error: could not write file "${filePath}".`);
    process.exitCode = 1;
    return;
  }

  const relativePath = path.relative(process.cwd(), filePath);
  const relativeDir = path.relative(process.cwd(), resolvedDir);

  log('');
  log(`\x1b[32m  Created registry.ts at ${relativePath}\x1b[0m`);
  log('');
  log('\x1b[1m  Next steps:\x1b[0m');
  log('');

  const deps = getDependencies(adapter);
  log(`    1. Install dependencies:`);
  log(`       \x1b[36mnpm install ${deps.join(' ')}\x1b[0m`);
  log('');
  log('    2. Update the component imports in registry.ts to match your project');
  log('');
  log('    3. Use the registry in your app:');
  log('');
  log(`       \x1b[36mimport { registry } from './${relativeDir}/registry';\x1b[0m`);
  log(`       \x1b[36mimport { GenerativeUI } from '@genui/react';\x1b[0m`);
  log('');
}
