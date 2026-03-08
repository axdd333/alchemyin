import { describe, expect, it } from 'vitest';
import { parseHash, routeToHash } from '../../src/lib/router';

describe('router', () => {
  it('parses chamber hashes', () => {
    expect(parseHash('#philosophy')).toEqual({ kind: 'chamber', key: 'philosophy' });
    expect(parseHash('#oracle')).toEqual({ kind: 'chamber', key: 'oracle' });
  });

  it('parses the systems chamber hash', () => {
    expect(parseHash('#systems')).toEqual({ kind: 'chamber', key: 'systems' });
  });

  it('parses document hashes', () => {
    expect(parseHash('#doc/american-favela')).toEqual({
      kind: 'document',
      id: 'american-favela'
    });
  });

  it('falls back to idle for unknown hashes', () => {
    expect(parseHash('#unknown-route')).toEqual({ kind: 'idle' });
    expect(parseHash('#doc/unknown')).toEqual({ kind: 'idle' });
    expect(parseHash('')).toEqual({ kind: 'idle' });
  });

  it('serializes routes back to hashes', () => {
    expect(routeToHash({ kind: 'idle' })).toBe('#');
    expect(routeToHash({ kind: 'chamber', key: 'systems' })).toBe('#systems');
    expect(routeToHash({ kind: 'chamber', key: 'philosophy' })).toBe('#philosophy');
    expect(routeToHash({ kind: 'document', id: 'american-favela' })).toBe(
      '#doc/american-favela'
    );
  });
});
