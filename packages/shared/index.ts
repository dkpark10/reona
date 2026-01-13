export class Queue<T> {
  private arr: T[] = [];

  private head = 0;

  public enqueue(v: T) {
    this.arr.push(v);
  }

  public dequeue() {
    if (this.head >= this.arr.length) return undefined;
    return this.arr[this.head++];
  }

  public isEmpty() {
    return this.arr.length - this.head <= 0;
  }

  public clear() {
    this.arr = [];
    this.head = 0;
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
    typeof window !== 'undefined' &&
    // @ts-ignore
    typeof window.Element.prototype.moveBefore === 'function'
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
  return value === null || (typeof value !== 'object' && typeof value !== 'function');
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

// ex) 0__reona_key__
export function createKey(depth: number, key?: string | number) {
  return `${depth}__reona_key__${key || ''}`;
}

// ex) 0__reona_key__ 에서 숫자를 추출
export function getDepth(key: string) {
  return Number(key.match(/^\d+/)![0]);
}
