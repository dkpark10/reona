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

export const generateId = (() => {
  let id = 0;
  return () => {
    return id++;
  };
})();

export function isPrimitive(value: unknown) {
  return (
    value === null || (typeof value !== "object" && typeof value !== "function")
  );
}

type Observer<T> = (value: T) => void;

export class Observable<T> {
  private observers = new Set<Observer<T>>();

  subscribe(fn: Observer<T>) {
    this.observers.add(fn);

    return () => {
      this.observers.delete(fn);
    };
  }

  notify(value: T) {
    this.observers.forEach(function (fn) {
      fn(value);
    });
  }

  clear() {
    this.observers.clear();
  }
}

// const state$ = new Observable<number>();
// const unsub1 = state$.subscribe((v) => {
//   console.log('observer 1:', v);
// });
// const unsub2 = state$.subscribe((v) => {
//   console.log('observer 2:', v);
// });
// state$.notify(1);
// // observer 1: 1
// // observer 2: 1
// unsub1();
// state$.notify(2);
// // observer 2: 2
