export function isPrimitive(value: unknown) {
  return (
    value === null || (typeof value !== "object" && typeof value !== "function")
  );
}

export function unescapeHtml(str: string) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(str, "text/html");
  return doc.documentElement.textContent;
}

const replacements = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};
export const escapeHtml = (str: string) =>
  str.replace(/[&<>"']/g, replacements[str as keyof typeof replacements]);

export function isHtmlString(str: string): boolean {
  const parser = new DOMParser();
  const doc = parser.parseFromString(str, "text/html");

  // body 내부에 요소 노드(Element)가 하나라도 있으면 HTML로 본다.
  return doc.body.children.length > 0;
}

export function Component(tagName: string) {
  return function (constructor: CustomElementConstructor) {
    if (!customElements.get(tagName)) {
      customElements.define(tagName, constructor);
    }
  };
}

export const generateId = (() => {
  let id = 0;
  return () => {
    return id++;
  };
})();

export class Stack<T> {
  private data: T[] = [];

  push(data: T) {
    this.data.push(data);
  }

  pop() {
    this.data.pop();
  }

  top() {
    return this.data[this.data.length - 1];
  }
}