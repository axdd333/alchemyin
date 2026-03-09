import type { DocumentContent, DocumentId } from './types';

export const DOCUMENTS: Record<DocumentId, DocumentContent> = {
  'design-intent': {
    theme: 'artifacts',
    kicker: 'Field Note · DI-01',
    title: 'Design Intent',
    subtitle: 'On building surfaces that earn trust before they demand attention.',
    sections: [
      {
        heading: '1. Premise',
        paragraphs: [
          'Every interface makes a promise. The shape of a button, the weight of a heading, the pace of a transition — each is a small contract with the person on the other side.',
          'Design intent is the discipline of keeping those promises consistent, even when the system behind them is not.'
        ]
      },
      {
        heading: '2. Guiding Constraints',
        paragraphs: [
          'Legibility over decoration. A surface should be readable at arm\'s length, in poor light, and after twelve hours of use.',
          'Composure over cleverness. Animation exists to orient, not to entertain. If removing it breaks comprehension, the layout was already wrong.',
          'Honesty over polish. A loading state that names itself is more trustworthy than a skeleton screen that pretends the content has arrived.'
        ]
      },
      {
        heading: '3. Material Sensibility',
        paragraphs: [
          'Glass, grain, and warm light are not aesthetic choices — they are structural. They signal depth, establish hierarchy, and give the eye a place to rest between actions.',
          'The goal is not beauty for its own sake. It is the kind of calm that lets someone use a tool for years without fatigue.'
        ]
      }
    ]
  }
};
