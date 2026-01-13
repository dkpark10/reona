/** @description 실제 dom 조작 로직을 여기다 작성 */

import type { VNode } from './parser';
import type { ComponentInstance, Props, Data, Methods } from '../utils/types';
import { createComponent } from './component';
import Fiber from './fiber';

interface Option {
  props?: Props;
  key?: string;
}

export function rootRender<P extends Props>(
  container: Element,
  instance: () => any,
  options?: Option
) {
  const getFiber = createComponent(instance as () => ComponentInstance<P, Data, Methods>, {
    props: options?.props,
    key: options?.key,
  });

  const fiber = getFiber(0);
  fiber.render(container);
  return fiber;
}

/** @description 가장 가까운 부모 찾음  */
// export function getClosestParent(node: Node): Element | null {
//   let parent = node.parentElement;
//   while (parent && parent.parentElement) {
//     parent = parent.parentElement;
//   }
//   return parent;
// }

/** @description vnode 객체를 실제 dom 으로 만듬 */
export function createDOM(vnode: VNode, fiber: Fiber): HTMLElement;
export function createDOM(vnode: VNode, fiber: Fiber, parentElement: Element): HTMLElement;
export function createDOM(vnode: VNode, fiber: Fiber, parentElement?: Element) {
  if (vnode.type === 'text') {
    return document.createTextNode(vnode.value);
  }

  if (vnode.type === 'component') {
    // todo 부모에서 리렌더링 시 자식을 어떻게 처리해야 할지?? 이대로??
    const fiber = vnode.fiber;
    fiber.render(parentElement!);
    return null;
  }

  // todo DocumentFragment (tag 없는 루트 최적화)
  if (!vnode.tag) {
    const fragment = document.createDocumentFragment();
    vnode.children?.forEach((child) => {
      fragment.appendChild(createDOM(child, fiber));
    });
    return fragment;
  }

  const el = document.createElement(vnode.tag);

  if (vnode.attr) {
    for (const [key, value] of Object.entries(vnode.attr)) {
      if (/@([^\s=/>]+)/.test(key) && typeof value === 'function') {
        const eventName = key.slice(1);
        el.addEventListener(eventName, value);
      } else {
        if (/^\$\$ref\b/.test(key)) {
          fiber.instance.setRefs(value, el);
        } else {
          el.setAttribute(key, value);
        }
      }
    }
  }

  vnode.children?.forEach((child) => {
    const c = createDOM(child, fiber, el);
    if (c) {
      el.appendChild(c);
    }
  });

  return el;
}
