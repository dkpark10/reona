import type { RenderResult } from "@/utils/types";

export function html(
  strings: TemplateStringsArray,
  ...values: any[]
): RenderResult {
  let idx = 0;
  const rawString = strings
    .join("%%identifier%%")
    .replace(/%%identifier%%/g, () => `__marker_${idx++}__`);

  const parser = new DOMParser();
  const doc = parser.parseFromString(rawString, "text/html");

  // body 내부에 요소 노드(Element)가 하나라도 있으면 HTML로 본다.
  if (doc.body.children.length <= 0) {
    throw new Error("잘못된 html 형식입니다.");
  }

  return { template: rawString, values, doc };
}
