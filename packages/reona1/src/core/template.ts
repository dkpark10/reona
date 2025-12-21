import { ReonaElement } from "./element";
import { isHtmlString } from "@/utils";

export type RenderResult = {
  template: string;
  values: any[];
};

export function html(
  strings: TemplateStringsArray,
  ...values: any[]
): RenderResult {
  let idx = 0;
  const rawString = strings
    .join("%%identifier%%")
    .replace(/%%identifier%%/g, () => `__marker_${idx++}__`);

  if (!isHtmlString(rawString)) throw new Error("잘못된 html 형식입니다.");
  return { template: rawString, values };
}

export function createFragmentElement(html: string) {
  const template = document.createElement("template");
  template.innerHTML = html.trim();
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

  const textNodes = collectTextMarkers(fragment);

  for (const textNode of textNodes) {
    const content = textNode.textContent ?? "";

    const parts = content.split(/(__marker_\d+__)/g);
    const fragment = document.createDocumentFragment();

    for (const part of parts) {
      const match = part.match(/__marker_(\d+)__/);

      if (match) {
        const value = values[Number(match[1])];

        /** @desc 컴포넌트 일 시 */
        if (value instanceof ReonaElement) {
          const res = value.render();
          const frag = createFragmentElement(res.template);
          processMarkers(frag, res.values);
          fragment.appendChild(frag);

          queueMicrotask(() => {
            value.__mounted?.();
          })
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
