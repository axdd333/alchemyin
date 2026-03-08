export interface SystemEntry {
  name: string;
  href: string;
  category: string;
  status: string;
  summary: string;
  tagline: string;
  description: string;
}

export const SYSTEM_LINKS: SystemEntry[] = [
  {
    name: 'ExamCove',
    href: 'https://examcove.com/',
    category: 'Program',
    status: 'Live',
    summary:
      'The first showcased program in this directory. Add the rest of your SaaS products and software lines here as the catalog grows.',
    tagline: 'Live site',
    description:
      'The first showcased program in this directory. Add the rest of your SaaS products and software lines here as the catalog grows.'
  }
];
