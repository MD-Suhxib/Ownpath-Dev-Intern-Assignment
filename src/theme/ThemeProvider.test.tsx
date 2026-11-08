import { describe, expect, it } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ThemeProvider, ThemeContext } from './ThemeProvider';
import { DEFAULT_PRESET } from './presets';
import type { GrayTint } from '../tokens/brand';

describe('ThemeProvider gray tint regression test', () => {
  it('updates emitted --ev-gray CSS variables when brand grayTint is changed', () => {
    function getEmittedForTint(grayTint: GrayTint) {
      let capturedEmitted: any = null;
      function TestConsumer() {
        const ctx = React.useContext(ThemeContext);
        capturedEmitted = ctx?.emitted;
        return null;
      }
      const brand = { ...DEFAULT_PRESET, grayTint };
      renderToStaticMarkup(
        <ThemeProvider defaultPreset={brand}>
          <TestConsumer />
        </ThemeProvider>,
      );
      return capturedEmitted;
    }

    const defaultEmitted = getEmittedForTint('gray');
    const grayStep9 = defaultEmitted?.light['--ev-gray-9'];
    expect(grayStep9).toBeDefined();

    const tints: GrayTint[] = ['mauve', 'slate', 'sage', 'olive', 'sand'];
    for (const tint of tints) {
      const tintEmitted = getEmittedForTint(tint);
      const step9 = tintEmitted?.light['--ev-gray-9'];
      expect(step9, `grayTint=${tint} step 9 should be defined`).toBeDefined();
      // Regression check: grayTint options must emit distinct tinted gray scales, not the un-tinted global gray primitive
      expect(
        step9,
        `grayTint=${tint} step 9 should differ from standard gray step 9`,
      ).not.toEqual(grayStep9);
    }
  });

  it('isolates theme state when key prop changes across libraries', () => {
    let capturedBrand: any = null;
    function TestConsumer() {
      const ctx = React.useContext(ThemeContext);
      capturedBrand = ctx?.brand;
      return null;
    }

    const voltPreset = { ...DEFAULT_PRESET, name: 'Volt', accentHex: '#00c16a' };
    const atlasPreset = { ...DEFAULT_PRESET, name: 'Atlas Web', accentHex: '#0055ff' };

    // Simulate Volt active with key="volt"
    renderToStaticMarkup(
      <ThemeProvider key="volt" storageKey="prism-ui-theme:volt" defaultPreset={voltPreset}>
        <TestConsumer />
      </ThemeProvider>,
    );
    expect(capturedBrand?.accentHex).toBe('#00c16a');

    // Simulate switching to Atlas Web with key="atlas-web"
    renderToStaticMarkup(
      <ThemeProvider key="atlas-web" storageKey="prism-ui-theme:atlas-web" defaultPreset={atlasPreset}>
        <TestConsumer />
      </ThemeProvider>,
    );
    // Regression check: Atlas Web must use its own defaultPreset, not leak Volt's accentHex
    expect(capturedBrand?.accentHex).toBe('#0055ff');
  });
});

