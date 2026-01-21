import { state } from './hooks'
import ComponentInstance, { getInstanceMap } from './component-instance';

/**
 * @param {string[]} strings 
 * @param  {any[]} values 
 */
function html(strings, ...values) {
  let idx = 0;
  const rawString = strings
    .join('%%identifier%%')
    .replace(/%%identifier%%/g, () => `__marker_${idx++}__`);

  return { template: rawString, values };
}

/**
 * @typedef {Object} ComponentOption
 * @property {object} props
 */

/**
 * @param {import('./parser').RenderResult} component 
 * @param {ComponentOption} param1 
 */
function createComponent(component, options) {
   const instanceMap = getInstanceMap();

  /**
   * @param {number} sequence 
   * sequence를 key로서 사용
   */
  const func = function getInstance(sequence) {
    let instance = instanceMap.get(sequence);
    if (!instance) {
      instance = new ComponentInstance(component, sequence);
      instanceMap.set(sequence, instance);
    }

    if (options && options.props) {
      instance.props = options.props;
    }

    return instance;
  }

  // parser 에서 컴포넌트를 생성하는 함수
  func.__isCreateComponent = true;
  return func;  
}

export {
  state, html, createComponent
};

