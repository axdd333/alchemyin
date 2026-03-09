import { CREED } from './creed';
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
    title: CREED.title,
    paragraphs: CREED.stanzas.map((stanza) => stanza.join('\n')),
    note: 'A creed for the work of dreamers, thinkers, and makers.',
    accentLabel: CREED.note,
    ctaLabel: 'Open philosophy page'
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
    accentLabel: 'Interfaces · operations · maintainability',
    ctaLabel: 'Open systems page'
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
    documentId: 'design-intent',
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
