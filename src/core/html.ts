import { isHtmlString } from "@/utils";
import { ReonaElement } from "./element";

export type ReturnHtml = [string, any[]];

export function html(
  strings: TemplateStringsArray,
  ...values: any[]
): ReturnHtml {
  let idx = 0;
  const rawString = strings
    .join("%%identifier%%")
    .replace(/%%identifier%%/g, () => `__marker_${idx++}__`);

  if (!isHtmlString(rawString)) throw new Error("잘못된 html 형식입니다.");
  return [rawString, values];
}

/** @desc 문자열 받은거 dom으로 만듬 */
export function createRenderableDom(
  strings: string,
  values: any[]
): HTMLTemplateElement {
  const template = document.createElement("template");
  template.innerHTML = strings.trim();

  const treeWalker = document.createTreeWalker(
    template.content,
    NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT
  );

  let currentNode: Node | null;
  while ((currentNode = treeWalker.nextNode())) {
    // 텍스트 노드 처리
    if (currentNode.nodeType === Node.TEXT_NODE) {
      const match = currentNode.textContent?.match(/__marker_(\d+)__/);

      if (match) {
        const idx = Number(match[1]);
        const value = values[idx];

        if (value instanceof ReonaElement) {
          const [strings, values] = value.render();
          const dom = createRenderableDom(strings, values);
          // currentNode.parentNode?.replaceChild(dom.content, currentNode);
        } else {
          currentNode.textContent = currentNode.textContent!.replace(
            /__marker_(\d+)__/,
            String(value)
          );
        }
      }
      continue;
    }

    // 요소 노드(Attribute) 처리
    if (currentNode.nodeType === Node.ELEMENT_NODE) {
      const el = currentNode as Element;

      for (const attr of [...el.attributes]) {
        const match = attr.value.match(/__marker_(\d+)__/);
        if (match) {
          const idx = Number(match[1]);
          const value = values[idx];

          if (/@([^\s=/>]+)/.test(attr.name) && typeof value === "function") {
            const eventName = attr.name.slice(1);
            el.addEventListener(eventName, value);
          } else {
            el.setAttribute(attr.name, value);
          }
        }
      }
    }
  }

  return template;
}
