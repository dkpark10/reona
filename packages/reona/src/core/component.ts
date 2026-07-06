import type { RenderResult, Component, Props } from '../utils/types';
import { shallowEqual } from '../../../shared';
import ComponentInstance, { getInstanceMap, type InstancePath } from './component-instance';

interface CreateComponentOption<P extends Props> {
  key?: string | number;
  props?: P;
}

export function createComponent<P extends Props>(
  component: Component,
  options?: CreateComponentOption<P>
) {
  const instanceMap = getInstanceMap();
  /** @description path: 컴포넌트의 트리에서의 경로 (ex. "0/1/0") */
  const func = function getInstance(path: InstancePath) {
    const key = options?.key;

    let instanceDeps = instanceMap.get(component);
    if (!instanceDeps) {
      instanceDeps = new Map();
    }

    let instance: ComponentInstance | undefined = instanceDeps.get(path);
    if (!instance) {
      instance = new ComponentInstance(component, { key, componentPath: path });
      instanceDeps.set(path, instance);
      instanceMap.set(component, instanceDeps);
    }

    if (options && options.props) {
      instance.nextProps = options.props;
      instance.hookHandler.watchPropsTrigger =
        !!(instance.nextProps && instance.prevProps) &&
        !shallowEqual(instance.nextProps, instance.prevProps);
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
