/** @description 실제 dom 조작 로직을 여기다 작성 */

import type { ComponentOptions, Props, Data, Methods } from "../utils/types";
import { regist, getInstanceMap } from "./fiber";

export function rootRender<P extends Props>(
  container: Element,
  instance: ComponentOptions<P, Data, Methods>,
  props?: P
) {
  regist({
    instance,
    props,
    key: "root",
  });

  const fiber = getInstanceMap().get(instance);

  if (fiber) {
    const fragment = fiber.getFragment();
    container.appendChild(fragment);

    queueMicrotask(() => {
      instance.mounted?.();
    });
  }
}
