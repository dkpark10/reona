import type { RenderResult, Component, Props } from '../utils/types';
import { isHtmlString } from '../utils';
import { createKey, shallowEqual } from '../../../shared';
import Fiber, { getInstanceMap } from './fiber';

interface CreateComponentOption<P extends Props> {
  key?: string | number;
  props?: P;
}

export function createComponent<P extends Props>(
  component: Component,
  options?: CreateComponentOption<P>
) {
  const instanceMap = getInstanceMap();
  /** @description 컴포넌트의 depth */
  const func = function getFiber(depth: number) {
    const key = createKey(depth, options?.key);

    let instanceDeps = instanceMap.get(component);
    if (!instanceDeps) {
      instanceDeps = new Map();
    }

    let fiber: Fiber | undefined = instanceDeps.get(key);
    if (!fiber) {
      fiber = new Fiber(component, { key });
      instanceDeps.set(key, fiber);
      instanceMap.set(component, instanceDeps);
    }

    if (options && options.props) {
      fiber.nextProps = options.props;
      if ((fiber.nextProps && fiber.prevProps) && !shallowEqual(fiber.nextProps, fiber.prevProps)) {
        fiber.watchPropsTrigger = true;
      }
    }
    return fiber;
  };
  func.__isCreateComponent = true;
  return func;
}

export function html(strings: TemplateStringsArray, ...values: any[]): RenderResult {
  let idx = 0;
  const rawString = strings
    .join('%%identifier%%')
    .replace(/%%identifier%%/g, () => `__marker_${idx++}__`);

  if (!isHtmlString(rawString)) throw new Error('잘못된 html 형식입니다.');
  return { template: rawString, values };
}
