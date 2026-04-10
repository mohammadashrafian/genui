import { useEffect, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { z } from 'zod';
import type { LLMComponentOutput } from '@genuikit/core';
import { ComponentRegistry } from '@genuikit/core';
import { useGenerativeUI } from '../use-generative-ui.js';

const bannerSchema = z.object({
  label: z.string(),
  tone: z.enum(['info', 'success']).default('info'),
});

function StubBanner({ label, tone }: { label: string; tone: 'info' | 'success' }) {
  return (
    <div data-testid="banner" data-tone={tone}>
      {label}
    </div>
  );
}

function createRegistry() {
  const registry = new ComponentRegistry();
  registry.register('Banner', bannerSchema, StubBanner);
  return registry;
}

function RetryDrivenRenderer({
  registry,
  initialJson,
  retryLLM,
  onCorrectionPrompt,
}: {
  registry: ComponentRegistry;
  initialJson: string;
  retryLLM: (prompt: string) => string;
  onCorrectionPrompt: (prompt: string) => void;
}) {
  const [rawJson, setRawJson] = useState(initialJson);
  const output = JSON.parse(rawJson) as LLMComponentOutput;
  const { element, ok, correctionPrompt } = useGenerativeUI(registry, output);

  useEffect(() => {
    if (!ok && correctionPrompt) {
      onCorrectionPrompt(correctionPrompt);
      setRawJson(retryLLM(correctionPrompt));
    }
  }, [ok, correctionPrompt, onCorrectionPrompt, retryLLM]);

  return ok ? element : <div>Retrying...</div>;
}

describe('LLM correction retry flow', () => {
  it('retries invalid JSON output with a correction prompt and renders the corrected component', async () => {
    const registry = createRegistry();
    const invalidJson = JSON.stringify({
      type: 'Banner',
      props: { label: 123 },
    });

    const retryLLM = vi.fn((prompt: string) => {
      expect(prompt).toContain('Banner');
      expect(prompt).toContain('"label"');

      return JSON.stringify({
        type: 'Banner',
        props: { label: 'Recovered', tone: 'success' },
      });
    });

    const onCorrectionPrompt = vi.fn();

    render(
      <RetryDrivenRenderer
        registry={registry}
        initialJson={invalidJson}
        retryLLM={retryLLM}
        onCorrectionPrompt={onCorrectionPrompt}
      />,
    );

    await waitFor(() => {
      expect(onCorrectionPrompt).toHaveBeenCalledOnce();
    });

    await waitFor(() => {
      expect(screen.getByTestId('banner').textContent).toBe('Recovered');
    });

    expect(screen.getByTestId('banner').getAttribute('data-tone')).toBe('success');
    expect(retryLLM).toHaveBeenCalledOnce();
  });
});
