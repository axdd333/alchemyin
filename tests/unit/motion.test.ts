import { afterEach, describe, expect, it, vi } from 'vitest';
import { animateElement, prefersReducedMotion } from '../../src/lib/motion';

const originalMatchMedia = window.matchMedia;

afterEach(() => {
  window.matchMedia = originalMatchMedia;
});

describe('motion helpers', () => {
  it('detects reduced motion preferences safely', () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: true }) as typeof window.matchMedia;

    expect(prefersReducedMotion()).toBe(true);
  });

  it('reduces animation duration and finishes immediately when reduced motion is enabled', () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: true }) as typeof window.matchMedia;

    const element = document.createElement('div');
    const finish = vi.fn();
    const animate = vi.fn(() => ({
      finish,
      finished: Promise.resolve()
    }));

    Object.defineProperty(element, 'animate', {
      value: animate,
      configurable: true
    });

    const animation = animateElement(
      element,
      [{ opacity: 0 }, { opacity: 1 }],
      { duration: 320, easing: 'ease', fill: 'both' }
    );

    expect(animation).not.toBeNull();
    expect(animate).toHaveBeenCalledWith(
      [{ opacity: 0 }, { opacity: 1 }],
      expect.objectContaining({ duration: 1 })
    );
    expect(finish).toHaveBeenCalledTimes(1);
  });
});
