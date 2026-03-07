import { CHAMBER_KEYS, DOCUMENT_IDS, type AppRoute, type ChamberKey, type DocumentId } from '../content/types';

const chamberSet = new Set<string>(CHAMBER_KEYS);
const documentSet = new Set<string>(DOCUMENT_IDS);

export function parseHash(hash: string): AppRoute {
  const raw = hash.replace(/^#/, '').replace(/^\/+/, '').trim();

  if (!raw) {
    return { kind: 'idle' };
  }

  if (chamberSet.has(raw)) {
    return { kind: 'chamber', key: raw as ChamberKey };
  }

  if (raw.startsWith('doc/')) {
    const id = raw.slice(4);
    if (documentSet.has(id)) {
      return { kind: 'document', id: id as DocumentId };
    }
  }

  return { kind: 'idle' };
}

export function routeToHash(route: AppRoute): string {
  switch (route.kind) {
    case 'idle':
      return '#';
    case 'chamber':
      return `#${route.key}`;
    case 'document':
      return `#doc/${route.id}`;
  }
}

type RouteListener = (route: AppRoute) => void;

export class HashRouter {
  private currentRoute: AppRoute = { kind: 'idle' };
  private readonly listeners = new Set<RouteListener>();

  constructor(private readonly win: Window = window) {}

  start(): void {
    this.currentRoute = parseHash(this.win.location.hash);
    this.win.addEventListener('hashchange', this.handleChange);
    this.win.addEventListener('popstate', this.handleChange);
    this.emit();
  }

  stop(): void {
    this.win.removeEventListener('hashchange', this.handleChange);
    this.win.removeEventListener('popstate', this.handleChange);
  }

  subscribe(listener: RouteListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  navigate(route: AppRoute, options: { replace?: boolean } = {}): void {
    const nextHash = routeToHash(route);

    if (nextHash === this.win.location.hash) {
      this.currentRoute = route;
      this.emit();
      return;
    }

    if (options.replace) {
      this.win.history.replaceState({ hash: nextHash }, '', nextHash);
    } else {
      this.win.history.pushState({ hash: nextHash }, '', nextHash);
    }

    this.handleChange();
  }

  getCurrentRoute(): AppRoute {
    return this.currentRoute;
  }

  private readonly handleChange = (): void => {
    this.currentRoute = parseHash(this.win.location.hash);
    this.emit();
  };

  private emit(): void {
    this.listeners.forEach((listener) => {
      listener(this.currentRoute);
    });
  }
}
