/**
 * WCAG 2.2 contrast maths, used by the design-token test.
 *
 * Keeping this in the test suite means the palette cannot silently drift below
 * AA: a colour change that breaks a documented pairing fails `npm test`.
 */

export type Rgb = { r: number; g: number; b: number };

/** Parse `#rgb`, `#rrggbb` or `rgb()` into 0–255 channels. Throws on anything else. */
export function parseColor(value: string): Rgb {
  const input = value.trim().toLowerCase();
  const hex = input.startsWith('#') ? input.slice(1) : null;
  if (hex) {
    if (hex.length === 3) {
      const [r, g, b] = hex.split('').map((c) => parseInt(c + c, 16));
      return { r, g, b };
    }
    if (hex.length === 6) {
      return {
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16),
      };
    }
  }
  const rgb = /^rgba?\(([^)]+)\)$/.exec(input);
  if (rgb) {
    const [r, g, b] = rgb[1].split(/[\s,/]+/).filter(Boolean).map(Number);
    if ([r, g, b].every((n) => Number.isFinite(n))) return { r, g, b };
  }
  throw new Error(`Unsupported colour: ${value}`);
}

/** Relative luminance per WCAG 2.2 §relative-luminance. */
export function luminance({ r, g, b }: Rgb): number {
  const channel = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** Contrast ratio, always ≥ 1, formatted by callers. */
export function contrastRatio(foreground: string, background: string): number {
  const a = luminance(parseColor(foreground));
  const b = luminance(parseColor(background));
  const [light, dark] = a > b ? [a, b] : [b, a];
  return (light + 0.05) / (dark + 0.05);
}

/** WCAG 2.2 threshold: 4.5 for body text, 3 for large text and UI boundaries. */
export function meetsWcag(ratio: number, level: 'text' | 'large' | 'ui' = 'text'): boolean {
  return ratio >= (level === 'text' ? 4.5 : 3);
}
