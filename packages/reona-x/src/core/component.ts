import type { RenderResult, Component, Props } from '../utils/types';
import { createKey, shallowEqual } from '../../../shared';
import ComponentInstance, { getInstanceMap } from './component-instance';

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
  const func = function getInstance(sequence: number) {
    const key = createKey(sequence, options?.key);

    let instanceDeps = instanceMap.get(component);
    if (!instanceDeps) {
      instanceDeps = new Map();
    }

    let instance: ComponentInstance | undefined = instanceDeps.get(key);
    if (!instance) {
      instance = new ComponentInstance(component, { key, sequence });
      instanceDeps.set(key, instance);
      instanceMap.set(component, instanceDeps);
    }

    if (options && options.props) {
      instance.nextProps = options.props;
      instance.watchPropsTrigger = !!(instance.nextProps && instance.prevProps)
        && !shallowEqual(instance.nextProps, instance.prevProps);
    }
    return instance;
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
