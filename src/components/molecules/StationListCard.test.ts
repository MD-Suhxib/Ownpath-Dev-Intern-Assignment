import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('StationListCard selected variant CSS regression contract', () => {
  it('references valid --ev-card-selected-border token and applies raised transform', () => {
    const css = readFileSync(
      join(process.cwd(), 'src/components/molecules/molecules.css'),
      'utf8',
    );
    const selectedRule =
      css.match(/\.ev-station-card--selected\s*\{[^}]+\}/)?.[0] ?? '';

    expect(selectedRule, 'selected rule should exist in molecules.css').not.toBe('');
    expect(selectedRule).toContain('var(--ev-card-selected-border)');
    expect(selectedRule).not.toContain('var(--ev-card-selected-boder)');
    expect(selectedRule).toContain('transform: translateY(-2px)');
  });
});
