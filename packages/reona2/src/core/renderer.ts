/** @description 실제 dom 조작 로직을 여기다 작성 */

import type { ComponentOptions, Props, Data, Methods } from "../utils/types";
import { regist } from "./fiber";

export function rootRender<P extends Props>(
  container: Element,
  instance: ComponentOptions<P, Data, Methods>,
  props?: P
) {
  const fiber = regist({
    instance,
    props,
    key: "root",
  });

  fiber.setContainer(container);
  fiber.render();
}
