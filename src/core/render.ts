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
  });

  /** @description dom 이 붙고 레이아웃 전 queueMicrotask */
  queueMicrotask(() => {
    component.__mounted();
  });
}

/** @description 전역 컴포넌트 관리 map */
const componentMap = new WeakMap<
  Function,
  Map<string | number | symbol, ReonaElement>
>();

export function renderComponent<C extends new () => ReonaElement<any>>(
  Component: C,
  props: ExtractElementProps<C>,
  key = 'default'
) {
  let keyMap = componentMap.get(Component);

  if (!keyMap) {
    keyMap = new Map();
    componentMap.set(Component, keyMap);
  }

  let compoennt = keyMap.get(key);
  /** @description 컴포넌트 없으면 생성 */
  if (!compoennt) {
    compoennt = new Component();
    keyMap.set(key, compoennt);
  }

  compoennt.setProps(props);

  return compoennt;
}
