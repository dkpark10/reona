/** @description 실제 dom 조작 로직을 여기다 작성 */

import type { ComponentOptions, Props, Data, Methods } from "../utils/types";
import { createFragmentElement, processMarkers } from "./html";
import { regist, getInstanceMap } from "./fiber";

export function rootRender(
  container: Element,
  instance: ComponentOptions<Props, Data, Methods>,
  props?: Props
) {
  regist({
    instance,
    props,
    key: 'root',
  });

  const result = instance.render();
  const { fragment } = createFragmentElement(result.template);
  processMarkers(fragment, result.values);
  container.appendChild(fragment);
}

// export function renderComponent(
//   container: Element,
//   instance: ComponentOptions<Props, Data, Methods>
// ) {
//   const result = instance.render();
//   const { fragment } = createFragmentElement(result.template);
//   processMarkers(fragment, result.values);
//   container.replaceChildren(fragment);
// }
