/** @description 실제 dom 조작 로직을 여기다 작성 */

import type { VNode } from './parser';
import type { Component, Props } from '../utils/types';
import { createComponent } from './component';

interface RootRenderOptions<P extends Props> {
  props?: P;
  context?: Record<string, unknown>;
}

export function rootRender<P extends Props>(
  container: Element,
  component: Component | null,
  options?: RootRenderOptions<P>
) {
  if (!component) {
    throw new Error('컴포넌트가 없습니다.');
  }

  const getInstance = createComponent(component, {
    props: options?.props,
  });

  const instance = getInstance(0);
  (component as any).rootElement = container;
  (component as any).currentMatchedInstance = instance;
  instance.render(container);
  return instance;
}

type Invoker = ((e: Event) => void) & { value: (e: Event) => void };

const invokerMap = new WeakMap<Element, Record<string, Invoker>>();

/**
 * @description 이벤트 리스너는 invoker 하나만 등록하고 실제 핸들러는 invoker.value 로 교체한다.
 * 리렌더링 시 새 클로저로 바뀐 핸들러를 add/remove 없이 반영하기 위함.
 */
export function patchEvent(el: Element, eventName: string, handler?: (e: Event) => void) {
  let invokers = invokerMap.get(el);
  if (!invokers) {
    invokers = {};
    invokerMap.set(el, invokers);
  }

  const existing = invokers[eventName];
  if (handler && existing) {
    existing.value = handler;
    return;
  }

  if (handler) {
    const invoker = ((e: Event) => invoker.value(e)) as Invoker;
    invoker.value = handler;
    invokers[eventName] = invoker;
    el.addEventListener(eventName, invoker);
    return;
  }

  if (existing) {
    el.removeEventListener(eventName, existing);
    delete invokers[eventName];
  }
}

/** @description vnode 객체를 실제 dom 으로 만듬 */
export function createDOM(vnode: VNode): HTMLElement;
export function createDOM(vnode: VNode, parentElement: Element): HTMLElement;
export function createDOM(vnode: VNode, parentElement?: Element) {
  if (vnode.type === 'text') {
    return document.createTextNode(vnode.value);
  }

  if (vnode.type === 'component') {
    const instance = vnode.instance;
    instance.render(parentElement!, true);
    return null;
  }

  // todo DocumentFragment (tag 없는 루트 최적화)
  if (!vnode.tag) {
    const fragment = document.createDocumentFragment();
    vnode.children?.forEach((child) => {
      fragment.appendChild(createDOM(child));
    });
    return fragment;
  }

  const el = document.createElement(vnode.tag);

  if (vnode.attr) {
    for (const [key, value] of Object.entries(vnode.attr)) {
      if (/@([^\s=/>]+)/.test(key) && typeof value === 'function') {
        patchEvent(el, key.slice(1), value);
      } else {
        if (/^\$\$ref\b/.test(key)) {
          const refValue = value;
          if (typeof refValue === 'function') {
            refValue(el);
          } else {
            if (Object.prototype.hasOwnProperty.call(refValue, 'current')) {
              refValue.current = el;
            }
          }
        } else {
          el.setAttribute(key, value);
        }
      }
    }
  }

  vnode.children?.forEach((child) => {
    const c = createDOM(child, el);
    if (c) {
      el.appendChild(c);
    }
  });

  return el;
}
