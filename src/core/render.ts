import { effect } from "./reactivity";
import { createFragmentElement, processMarkers } from "@/core/template";
import type { ReonaElement } from "./element";
import type { ExtractElementProps } from "@/utils/types";

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
      component.mounted?.();
    });
  });
}

export function renderComponent<C extends new () => ReonaElement<any>>(
  component: C,
  props: ExtractElementProps<C>
) {
  return component;
}
