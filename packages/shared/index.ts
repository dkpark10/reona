export class Stack<T> {
  private data: T[] = [];
  constructor() {}

  public push(value: T) {
    this.data.push(value);
  }

  public pop() {
    this.data.pop();
  }

  public top() {
    return this.data[this.data.length - 1];
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