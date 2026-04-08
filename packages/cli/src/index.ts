import { initCommand } from './commands/init.js';

const HELP_TEXT = `
  \x1b[1m@genuikit/cli\x1b[0m — Scaffold GenUI component registries

  \x1b[1mUsage:\x1b[0m
    npx @genuikit/cli <command>

  \x1b[1mCommands:\x1b[0m
    init        Initialize a component registry for your project

  \x1b[1mOptions:\x1b[0m
    --help, -h  Show this help message
    --version   Show version number
`;

function printVersion(): void {
  // Intentionally hardcoded — avoids a runtime JSON import for a CLI one-liner.
  console.log('0.4.0');
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === '--help' || command === '-h') {
    console.log(HELP_TEXT);
    return;
  }

  if (command === '--version') {
    printVersion();
    return;
  }

  if (command === 'init') {
    await initCommand();
    return;
  }

  console.error(`Unknown command: "${command}". Run \`npx @genuikit/cli --help\` for usage.`);
  process.exitCode = 1;
}

main().catch((error: unknown) => {
  console.error('Unexpected error:', error);
  process.exitCode = 1;
});
