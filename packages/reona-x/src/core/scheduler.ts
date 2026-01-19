class Scheduler {
  private queue: (() => void | Promise<void>)[] = [];
  private running = false;

  push(fn: () => void | Promise<void>) {
    this.queue.push(fn);
    this.flush();
  }

  private async flush() {
    if (this.running) return;

    this.running = true;

    while (this.queue.length > 0) {
      const fn = this.queue.shift()!;
      await fn();
    }

    this.running = false;
  }
}

export const scheduler = new Scheduler();
