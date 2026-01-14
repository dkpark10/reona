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

const scheduler = new Scheduler();

const delay = (d: number) => new Promise((resolve) => setTimeout(resolve, d));

scheduler.push(() => console.log('1'));
scheduler.push(async () => {
  await delay(1000);
  console.log('2');
});
scheduler.push(() => console.log('3'));
