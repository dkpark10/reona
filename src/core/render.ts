import { effect } from "./reactivity";
import { createRenderableDom } from "./html";

export function rootRender(container: Element, Component: new () => any) {
  const c = new Component();
  effect(() => {
    const [strings, values] = c.render();
    const dom = createRenderableDom(strings, values);
    container.replaceChildren(dom.content);
  });
}
