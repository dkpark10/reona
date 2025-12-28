import { Fiber } from "./fiber";

export function createFragmentElement(html: string) {
  const template = document.createElement("template");
  template.innerHTML = html.trim();

  const elementNodes = Array.from(template.content.childNodes)
    .filter(node => node.nodeType === Node.ELEMENT_NODE);

  if (elementNodes.length !== 1) {
    throw new Error("루트 엘리먼트가 존재하지 않습니다.");
  }

  return template.content;
}

export function handleAttributes(el: Element, values: any[]) {
  [...el.attributes].forEach((attr) => {
    const match = attr.value.match(/__marker_(\d+)__/);
    if (!match) return;

    const value = values[Number(match[1])];

    if (/@([^\s=/>]+)/.test(attr.name) && typeof value === "function") {
      el.addEventListener(attr.name.slice(1), value);
      el.removeAttribute(attr.name);
      return;
    }

    el.setAttribute(attr.name, String(value));
  });
}

/** @description 마커표시된 텍스트 엘리먼트만을 수집하는 함수 */
function collectTextMarkers(root: DocumentFragment): Text[] {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);

  const nodes: Text[] = [];
  let node: Node | null;

  while ((node = walker.nextNode())) {
    if (/__marker_\d+__/.test(node.textContent ?? "")) {
      nodes.push(node as Text);
    }
  }

  return nodes;
}

export function processMarkers(fragment: DocumentFragment, values: any[]) {
  const walker = document.createTreeWalker(fragment, NodeFilter.SHOW_ELEMENT);

  let el: Node | null;
  while ((el = walker.nextNode())) {
    /** @description 이벤트 핸들러 및 속성을 부착함 */
    handleAttributes(el as Element, values);
  }

  /** @description 마커표시된 텍스트 엘리먼트 리스트 */
  const textNodes = collectTextMarkers(fragment);

  for (const textNode of textNodes) {
    const content = textNode.textContent ?? "";

    const parts = content.split(/(__marker_\d+__)/g);
    const fragment = document.createDocumentFragment();

    for (const part of parts) {
      const match = part.match(/__marker_(\d+)__/);

      if (match) {
        const value = values[Number(match[1])];

        /** @desc todo 컴포넌트 일 시 */
        if (value instanceof Fiber) {
          // fragment.appendChild(value.getFragment());
        } else if (value instanceof Node) {
          /** @desc DOM 일 시 */
          fragment.appendChild(value);
        } else {
          /** @desc 원시객체일 시 */
          fragment.appendChild(document.createTextNode(String(value)));
        }
      } else {
        fragment.appendChild(document.createTextNode(part));
      }
    }

    textNode.replaceWith(fragment);
  }
}
