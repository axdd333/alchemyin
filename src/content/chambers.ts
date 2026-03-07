import type { ChamberContent, ChamberKey } from './types';

export const CHAMBER_ORDER: ChamberKey[] = [
  'philosophy',
  'systems',
  'artifacts',
  'oracle'
];

export const CHAMBERS: Record<ChamberKey, ChamberContent> = {
  philosophy: {
    navLabel: 'Philosophy',
    label: 'Chamber I · Philosophy',
    title: 'What a system assumes about the world.',
    paragraphs: [
      'Every tool encodes a set of assumptions. This chamber is where those assumptions are made explicit instead of living quietly in the background.',
      'We ask: under what conditions does this model still hold, and who carries the cost when it stops?'
    ],
    note: 'Assumptions become design material before they become hidden cost.',
    accentLabel: 'Assumptions · burden · legibility'
  },
  systems: {
    navLabel: 'Systems',
    label: 'Chamber II · Systems',
    title: 'The architecture that carries the weight.',
    paragraphs: [
      'Interfaces, protocols, automation, and observability. The invisible structure that determines whether an idea survives contact with real environments.',
      'We prefer systems that can be explained on a single sheet of paper and maintained by ordinary people, not heroes.'
    ],
    note: 'Infrastructure should be plainspoken enough to survive the night shift.',
    accentLabel: 'Interfaces · operations · maintainability'
  },
  artifacts: {
    navLabel: 'Artifacts',
    label: 'Chamber III · Artifacts',
    title: 'Surfaces built to survive strange weather.',
    paragraphs: [
      'Eventually abstraction becomes matter: devices, dashboards, scripts, field tools. This is the layer where ideas accept the constraints of hardware, time, and exhaustion.',
      'The emphasis is on ergonomics, legibility, and removing everything that does not directly serve use in the field.'
    ],
    note: 'Beauty matters here because trust is often built from surfaces first.',
    accentLabel: 'Field tools · ergonomics · strange weather',
    documentId: 'american-favela',
    ctaLabel: 'Open field note'
  },
  oracle: {
    navLabel: 'Oracle',
    label: 'Chamber IV · Oracle',
    title: 'Structured doubt for irreversible moves.',
    paragraphs: [
      'We treat forecasting as disciplined doubt rather than performance. Scenarios, sensitivities, and envelopes of failure, instead of single-line predictions.',
      'The goal is to map the terrain before walking it, so that when we do commit, we know what we are trading for what.'
    ],
    note: 'Forecasting becomes useful when it names tradeoffs instead of pretending certainty.',
    accentLabel: 'Scenarios · sensitivity · irreversible moves'
  }
};
