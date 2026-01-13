import Fiber from './fiber';

const renderQueue = new Set<Fiber>();
let rafId: number | null = null;

export function update(fiber: Fiber) {
  renderQueue.add(fiber);

  if (rafId !== null) return;

  rafId = requestAnimationFrame(() => {
    try {
      renderQueue.forEach((fiber) => {
        fiber.reRender();
      });
    } finally {
      renderQueue.clear();
      rafId = null;
    }
  });
}
