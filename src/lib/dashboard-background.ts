import type { CSSProperties } from 'react';

export interface DashboardBackgroundTheme {
  containerStyle: CSSProperties;
  blobOneStyle: CSSProperties;
  blobTwoStyle: CSSProperties;
}

interface Palette {
  base: string;
  blobOne: string;
  blobTwo: string;
}

const PALETTES: Palette[] = [
  {
    base: 'radial-gradient(70rem 30rem at 115% -10%, rgba(34, 211, 238, 0.08), transparent 55%), radial-gradient(64rem 28rem at -10% 120%, rgba(14, 165, 233, 0.08), transparent 60%)',
    blobOne: 'rgba(34, 211, 238, 0.24)',
    blobTwo: 'rgba(14, 165, 233, 0.2)',
  },
  {
    base: 'radial-gradient(70rem 30rem at 115% -10%, rgba(249, 115, 22, 0.08), transparent 55%), radial-gradient(64rem 28rem at -10% 120%, rgba(239, 68, 68, 0.08), transparent 60%)',
    blobOne: 'rgba(249, 115, 22, 0.22)',
    blobTwo: 'rgba(239, 68, 68, 0.2)',
  },
  {
    base: 'radial-gradient(70rem 30rem at 115% -10%, rgba(244, 114, 182, 0.08), transparent 55%), radial-gradient(64rem 28rem at -10% 120%, rgba(236, 72, 153, 0.08), transparent 60%)',
    blobOne: 'rgba(244, 114, 182, 0.22)',
    blobTwo: 'rgba(236, 72, 153, 0.2)',
  },
  {
    base: 'radial-gradient(70rem 30rem at 115% -10%, rgba(34, 197, 94, 0.08), transparent 55%), radial-gradient(64rem 28rem at -10% 120%, rgba(16, 185, 129, 0.08), transparent 60%)',
    blobOne: 'rgba(34, 197, 94, 0.22)',
    blobTwo: 'rgba(16, 185, 129, 0.2)',
  },
  {
    base: 'radial-gradient(70rem 30rem at 115% -10%, rgba(250, 204, 21, 0.08), transparent 55%), radial-gradient(64rem 28rem at -10% 120%, rgba(245, 158, 11, 0.08), transparent 60%)',
    blobOne: 'rgba(250, 204, 21, 0.22)',
    blobTwo: 'rgba(245, 158, 11, 0.2)',
  },
  {
    base: 'radial-gradient(70rem 30rem at 115% -10%, rgba(129, 140, 248, 0.08), transparent 55%), radial-gradient(64rem 28rem at -10% 120%, rgba(99, 102, 241, 0.08), transparent 60%)',
    blobOne: 'rgba(129, 140, 248, 0.22)',
    blobTwo: 'rgba(99, 102, 241, 0.2)',
  },
];

function hashSeed(seed: string): number {
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash >>> 0);
}

export function getDashboardBackgroundTheme(seed: string): DashboardBackgroundTheme {
  const idx = hashSeed(seed) % PALETTES.length;
  const palette = PALETTES[idx];

  return {
    containerStyle: {
      backgroundImage: palette.base,
    },
    blobOneStyle: {
      background: palette.blobOne,
    },
    blobTwoStyle: {
      background: palette.blobTwo,
    },
  };
}
