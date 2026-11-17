import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { contrastRatio, meetsWcag } from './contrast';

/**
 * The palette is a contract, not a suggestion. These assertions read the tokens
 * out of src/index.css so a colour edit cannot quietly drop below WCAG AA.
 */

const css = readFileSync(new URL('../index.css', import.meta.url), 'utf8');

function tokenBlock(selector: string): Record<string, string> {
  const start = css.indexOf(selector);
  assert.ok(start >= 0, `selector ${selector} not found in index.css`);
  const open = css.indexOf('{', start);
  const close = css.indexOf('}', open);
  const body = css.slice(open + 1, close);
  const tokens: Record<string, string> = {};
  for (const line of body.split('\n')) {
    const match = /^\s*(--[\w-]+):\s*([^;]+);/.exec(line);
    if (match) tokens[match[1]] = match[2].trim();
  }
  return tokens;
}

const light = tokenBlock(':root {');
const dark = { ...light, ...tokenBlock('.dark {') };

const pairs: Array<[label: string, fg: string, bg: string, level: 'text' | 'large' | 'ui']> = [
  ['light body text on canvas', light['--color-ink'], light['--color-canvas'], 'text'],
  ['light body text on surface', light['--color-ink'], light['--color-surface'], 'text'],
  ['light secondary text on canvas', light['--color-deep'], light['--color-canvas'], 'text'],
  ['light muted text on canvas', light['--color-muted'], light['--color-canvas'], 'text'],
  ['light muted text on surface', light['--color-muted'], light['--color-surface'], 'text'],
  ['light accent text on canvas', light['--color-accent-text'], light['--color-canvas'], 'text'],
  ['light white on filled brand action', '#ffffff', light['--color-primary-solid'], 'text'],
  ['light form boundary on surface', light['--color-border-strong'], light['--color-surface'], 'ui'],
  ['dark body text on canvas', dark['--color-ink'], dark['--color-canvas'], 'text'],
  ['dark body text on surface', dark['--color-ink'], dark['--color-surface'], 'text'],
  ['dark secondary text on canvas', dark['--color-deep'], dark['--color-canvas'], 'text'],
  ['dark muted text on canvas', dark['--color-muted'], dark['--color-canvas'], 'text'],
  ['dark muted text on surface', dark['--color-muted'], dark['--color-surface'], 'text'],
  ['dark accent text on canvas', dark['--color-accent-text'], dark['--color-canvas'], 'text'],
  ['dark white on filled brand action', '#ffffff', dark['--color-primary-solid'], 'large'],
  ['dark form boundary on surface', dark['--color-border-strong'], dark['--color-surface'], 'ui'],
  ['light success text', '#15803d', light['--color-surface'], 'text'],
  ['light warning text', '#b45309', light['--color-surface'], 'text'],
  ['light error text on surface', light['--status-error'], light['--color-surface'], 'text'],
];

for (const [label, fg, bg, level] of pairs) {
  test(`contrast: ${label}`, () => {
    assert.ok(fg && bg, `missing token for ${label}`);
    const ratio = contrastRatio(fg, bg);
    assert.ok(
      meetsWcag(ratio, level),
      `${label}: ${fg} on ${bg} is ${ratio.toFixed(2)}:1, needs ${level === 'text' ? 4.5 : 3}:1`
    );
  });
}

test('contrast: parseColor rejects nonsense instead of guessing', () => {
  assert.throws(() => contrastRatio('rebeccapurple', '#ffffff'));
  assert.equal(contrastRatio('#ffffff', '#000000'), 21);
});
