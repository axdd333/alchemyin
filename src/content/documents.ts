import type { DocumentContent, DocumentId } from './types';

export const DOCUMENTS: Record<DocumentId, DocumentContent> = {
  'american-favela': {
    theme: 'artifacts',
    kicker: 'Field Note · AF-01',
    title: 'The American Favela Thesis',
    subtitle: 'Notes on infrastructure, precarity, and tools that do not assume stability.',
    sections: [
      {
        heading: '1. Scope',
        paragraphs: [
          'This document sketches the constraints of operating in environments where formal infrastructure is intermittent, informal, or adversarial.',
          'It exists to inform how devices, drones, and software should behave when continuity cannot be assumed.'
        ]
      },
      {
        heading: '2. Design Pressure',
        paragraphs: [
          'Tools built for unstable contexts must prioritise recoverability, offline usefulness, and graceful degradation over marginal gains in ideal conditions.'
        ]
      },
      {
        heading: '3. Practical Consequence',
        paragraphs: [
          'A useful artifact must remain legible when power is scarce, attention is fragmented, and the person maintaining the system did not design it.'
        ]
      }
    ]
  }
};
