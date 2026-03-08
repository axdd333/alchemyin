export const CHAMBER_KEYS = ['philosophy', 'systems', 'artifacts', 'oracle'] as const;
export const DOCUMENT_IDS = ['american-favela'] as const;

export type ChamberKey = (typeof CHAMBER_KEYS)[number];
export type DocumentId = (typeof DOCUMENT_IDS)[number];
export type ThemeKey = ChamberKey | 'neutral';

export interface ChamberContent {
  navLabel: string;
  label: string;
  title: string;
  paragraphs: string[];
  note: string;
  accentLabel: string;
  documentId?: DocumentId;
  ctaLabel?: string;
}

export interface DocumentSection {
  heading: string;
  paragraphs: string[];
}

export interface DocumentContent {
  theme: ChamberKey;
  kicker: string;
  title: string;
  subtitle: string;
  sections: DocumentSection[];
}

export interface SystemLink {
  name: string;
  category: string;
  href: string;
  summary: string;
  status: string;
}

export type AppRoute =
  | { kind: 'idle' }
  | { kind: 'chamber'; key: ChamberKey }
  | { kind: 'document'; id: DocumentId };
