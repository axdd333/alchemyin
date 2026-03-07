export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export async function withViewTransition(update: () => void | Promise<void>): Promise<void> {
  const startViewTransition = document.startViewTransition;

  if (!startViewTransition || prefersReducedMotion()) {
    await update();
    return;
  }

  const transition = startViewTransition.call(document, update);

  try {
    await transition.finished;
  } catch {
    // Ignore aborted transitions.
  }
}

export function animateElement(
  element: HTMLElement,
  keyframes: Keyframe[],
  options: KeyframeAnimationOptions
): Animation | null {
  if (typeof element.animate !== 'function') {
    applyFinalFrame(element, keyframes);
    return null;
  }

  const resolvedOptions = prefersReducedMotion()
    ? { ...options, duration: 1 }
    : options;

  const animation = element.animate(keyframes, resolvedOptions);

  if (prefersReducedMotion()) {
    animation.finish();
  }

  return animation;
}

export async function waitForFonts(): Promise<void> {
  if ('fonts' in document) {
    await document.fonts.ready;
  }
}

function applyFinalFrame(element: HTMLElement, keyframes: Keyframe[]): void {
  const finalFrame = keyframes.at(-1);

  if (!finalFrame) {
    return;
  }

  Object.entries(finalFrame).forEach(([key, value]) => {
    if (typeof value === 'string' || typeof value === 'number') {
      (element.style as unknown as Record<string, string>)[key] = String(value);
    }
  });
}
