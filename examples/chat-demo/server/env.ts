import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { DemoProvider, ProviderStatus } from '../src/lib/contracts.js';

export interface DemoServerConfig {
  readonly port: number;
  readonly defaultProvider: DemoProvider;
  readonly openaiApiKey: string | null;
  readonly openaiModel: string;
  readonly anthropicApiKey: string | null;
  readonly anthropicModel: string;
}

const serverDir = dirname(fileURLToPath(import.meta.url));
const envFilePath = resolve(serverDir, '../.env');

let didLoadLocalEnv = false;

export function loadLocalEnv(): void {
  if (didLoadLocalEnv) {
    return;
  }

  didLoadLocalEnv = true;

  if (!existsSync(envFilePath)) {
    return;
  }

  const contents = readFileSync(envFilePath, 'utf8');
  for (const line of contents.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex <= 0) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const rawValue = trimmed.slice(separatorIndex + 1).trim();
    const value = rawValue.replace(/^['"]|['"]$/g, '');

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

export function getServerConfig(): DemoServerConfig {
  loadLocalEnv();

  const openaiApiKey = process.env.OPENAI_API_KEY?.trim() || null;
  const anthropicApiKey = process.env.ANTHROPIC_API_KEY?.trim() || null;
  const envProvider = process.env.LLM_PROVIDER === 'anthropic' ? 'anthropic' : 'openai';
  const firstConfiguredProvider = openaiApiKey
    ? 'openai'
    : anthropicApiKey
      ? 'anthropic'
      : envProvider;
  const requestedProviderConfigured =
    (envProvider === 'openai' && openaiApiKey) || (envProvider === 'anthropic' && anthropicApiKey);

  return {
    port: Number.parseInt(process.env.CHAT_DEMO_PORT ?? '3030', 10) || 3030,
    defaultProvider: (requestedProviderConfigured
      ? envProvider
      : firstConfiguredProvider) as DemoProvider,
    openaiApiKey,
    openaiModel: process.env.OPENAI_MODEL?.trim() || 'gpt-5.4-mini',
    anthropicApiKey,
    anthropicModel: process.env.ANTHROPIC_MODEL?.trim() || 'claude-sonnet-4-20250514',
  };
}

export function getProviderStatuses(): ProviderStatus[] {
  const config = getServerConfig();

  return [
    {
      provider: 'openai',
      label: 'OpenAI',
      model: config.openaiModel,
      configured: Boolean(config.openaiApiKey),
    },
    {
      provider: 'anthropic',
      label: 'Anthropic',
      model: config.anthropicModel,
      configured: Boolean(config.anthropicApiKey),
    },
  ];
}
