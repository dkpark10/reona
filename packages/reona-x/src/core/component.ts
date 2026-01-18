import type { RenderResult, Component, Props } from '../utils/types';
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
  /** @description 컴포넌트의 트리에서의 sequence */
  const func = function getFiber(sequence: number) {
    const key = createKey(sequence, options?.key);

    let instanceDeps = instanceMap.get(component);
    if (!instanceDeps) {
      instanceDeps = new Map();
    }

    let fiber: Fiber | undefined = instanceDeps.get(key);
    if (!fiber) {
      fiber = new Fiber(component, { key, sequence });
      instanceDeps.set(key, fiber);
      instanceMap.set(component, instanceDeps);
    }

    if (options && options.props) {
      fiber.nextProps = options.props;
      fiber.watchPropsTrigger = !!(fiber.nextProps && fiber.prevProps) 
        && !shallowEqual(fiber.nextProps, fiber.prevProps);
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

    return { template: rawString, values };
}
