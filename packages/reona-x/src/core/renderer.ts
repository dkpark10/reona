import ComponentInstance from './component-instance';

const renderQueue = new Set<ComponentInstance>();
let rafId: number | null = null;

export function update(instance: ComponentInstance) {
  renderQueue.add(instance);

  if (rafId !== null) return;

  rafId = requestAnimationFrame(() => {
    try {
      renderQueue.forEach((instance) => {
        instance.reRender();
      });
    } finally {
      renderQueue.clear();
      rafId = null;
    }
  });
}
