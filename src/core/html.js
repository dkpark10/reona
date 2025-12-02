/**
 * @param {string[]} strings
 * @param  {any[]} values
 * @returns {DocumentFragment} DOM 노드
 */
export function html(strings, ...values) {
  let idx = 0;
  const rawString = strings
    .join("%%identifier%%")
    .replace(/%%identifier%%/g, () => `__marker_${idx++}__`);

  const template = document.createElement("template");
  template.innerHTML = rawString.trim();

  const treeWalker = document.createTreeWalker(
    template.content,
    NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT
  );

  let currentNode;
  while ((currentNode = treeWalker.nextNode())) {
    // 텍스트 노드 처리
    if (currentNode.nodeType === Node.TEXT_NODE) {
      const match = currentNode.textContent.match(/__marker_(\d+)__/);
      if (match) {
        const idx = Number(match[1]);
        const value = values[idx];

        if (value instanceof Node) {
          currentNode.replaceWith(value);
        } else {
          currentNode.textContent = String(value);
        }
      }
      continue;
    }

    // element attributes 처리
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

  return template.content;
}
