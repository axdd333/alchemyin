export const MOTION_TOKENS = {
  duration: {
    micro: 180,
    standard: 320,
    emphasized: 520,
    ambient: 720,
    loadingExit: 640,
    dockShift: 520,
    scrimEnter: 280,
    scrimExit: 220,
    chamberEnter: 520,
    chamberExit: 280,
    documentEnter: 560,
    documentExit: 320,
    retarget: 360
  },
  easing: {
    enter: 'cubic-bezier(0.22, 1, 0.36, 1)',
    settle: 'cubic-bezier(0.16, 1, 0.3, 1)',
    standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
    exit: 'cubic-bezier(0.4, 0, 1, 1)',
    ambient: 'cubic-bezier(0.2, 0.8, 0.2, 1)'
  }
} as const;

export function prefersReducedMotion(): boolean {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}

export async function withViewTransition(
  update: () => void | Promise<void>,
  options: { enabled?: boolean } = {}
): Promise<void> {
  const startViewTransition = document.startViewTransition;
  const enabled = options.enabled ?? true;

  if (!enabled || !startViewTransition || prefersReducedMotion()) {
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

export async function waitForAnimations(
  animations: Array<Animation | null | undefined>
): Promise<void> {
  const pendingAnimations = animations.filter(
    (animation): animation is Animation => Boolean(animation)
  );

  if (!pendingAnimations.length) {
    return;
  }

  await Promise.all(
    pendingAnimations.map((animation) => animation.finished.catch(() => undefined))
  );
}

export function stopAnimations(element: Element): void {
  if (typeof element.getAnimations !== 'function') {
    return;
  }

  element.getAnimations().forEach((animation) => {
    animation.cancel();
  });
}

export async function nextFrame(): Promise<void> {
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => resolve());
  });
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
