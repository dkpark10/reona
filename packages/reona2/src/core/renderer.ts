let rafId: number | null = null;

export function update(renderCallbakc: () => void) {
  if (rafId !== null) return;

  rafId = requestAnimationFrame(() => {
    renderCallbakc();
    rafId = null;
  });
}
