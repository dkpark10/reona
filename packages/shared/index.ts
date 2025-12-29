export class Queue<T> {
  private items: { [key: number]: T } = {};
  private head = 0;
  private tail = 0;

  enqueue(item: T): void {
    this.items[this.tail] = item;
    this.tail++;
  }

  dequeue(): T | undefined {
    if (this.isEmpty()) return undefined;
    const item = this.items[this.head];
    delete this.items[this.head];
    this.head++;
    return item;
  }

  peek(): T | undefined {
    return this.items[this.head];
  }

  isEmpty(): boolean {
    return this.head === this.tail;
  }

  size(): number {
    return this.tail - this.head;
  }
}

export class Stack<T> {
  private items: T[] = [];

  push(item: T): void {
    this.items.push(item);
  }

  pop(): T | undefined {
    return this.items.pop();
  }

  top(): T | undefined {
    return this.items[this.items.length - 1];
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  size(): number {
    return this.items.length;
  }
}


export function supportsMoveBefore() {
  return (
    typeof window !== "undefined" &&
    // @ts-ignore
    typeof window.Element.prototype.moveBefore === "function"
  );
}

export function isEmpty<T extends Record<string, any>>(obj: T) {
  return Object.keys(obj).length <= 0;
}