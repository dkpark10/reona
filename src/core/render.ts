import { effect } from "./reactivity";
import { createFragmentElement, processMarkers } from "@/core/template";
import type { ReonaElement } from "./element";

export function rootRender(
  container: Element,
  Component: new () => ReonaElement
) {
  const component = new Component();
  effect(() => {
    const result = component.render();
    const fragment = createFragmentElement(result.template);
    processMarkers(fragment, result.values);
    container.replaceChildren(fragment);

    // dom 이 붙고 레이아웃 전 queueMicrotask
    queueMicrotask(() => {
      component.__markMounted?.();
    });
  });
}
