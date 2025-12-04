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

  if (!isHtmlString(rawString)) throw new Error("잘못된 html 형식");
  return [rawString, values];
}

// 문자열 받은거 돔으로 만듬
export function createRenderableDom(strings: string, values: any[]) {
  const template = document.createElement("template");
  template.innerHTML = strings.trim();

  const treeWalker = document.createTreeWalker(
    template.content,
    NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT
  );

  let currentNode;
  while ((currentNode = treeWalker.nextNode() as Element)) {
    // 텍스트 노드 처리
    if (currentNode.nodeType === Node.TEXT_NODE) {
      const match = currentNode.textContent?.match(/__marker_(\d+)__/);
      if (match) {
        const idx = Number(match[1]);
        const value = values[idx];

        if (value instanceof ReonaElement) {
          const [strings, values] = value.render();
          const dom = createRenderableDom(strings, values);
          currentNode.parentNode?.replaceChild(dom.content, currentNode);
        } else {
          // todo 텍스트가 아닌 노드가 올 때 개발
          currentNode.textContent = String(value);
        }
      }
      continue;
    }

    // @ts-ignore
    for (const attr of [...currentNode.attributes]) {
      const match = attr.value.match(/__marker_(\d+)__/);
      if (match) {
        const idx = Number(match[1]);
        const value = values[idx];

        if (/@([^\s=/>]+)/.test(attr.name) && typeof value === "function") {
          const eventName = attr.name.slice(1);
          currentNode.addEventListener(eventName, value);
        } else {
          currentNode.setAttribute(attr.name, value);
        }
        currentNode.removeAttribute(attr.name);
      }
    }
  }

  return template;
}
