export function flushRaf() {
  return new Promise(resolve => {
    requestAnimationFrame(() => {
      resolve(null);
    });
  });
}

export function flushMicrotasks() {
  return new Promise<void>(resolve => queueMicrotask(resolve));
}
