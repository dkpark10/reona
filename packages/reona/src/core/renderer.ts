const renderQueue = new Set<() => void>();
let rafId: number | null = null;

export function update(renderCallback: () => void) {
  renderQueue.add(renderCallback);

  if (rafId !== null) return;

  rafId = requestAnimationFrame(() => {
    try {
      renderQueue.forEach(fn => fn());
    } finally {
      renderQueue.clear();
      rafId = null;
    }
  });
}
