/** @description 실제 dom 조작 로직을 여기다 작성 */

import type { VNode } from './parser';
import type { Component } from '../utils/types';
import { createComponent } from './component';

export function rootRender(
  container: Element,
  component: Component,
  props?: Parameters<typeof component>[0]
) {
  const getInstance = createComponent(component, {
    props,
  });

  const instance = getInstance(0);
  instance.render(container);
  return instance;
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
        const eventName = key.slice(1);
        el.addEventListener(eventName, value);
      } else {
        if (/^\$\$ref\b/.test(key)) {
          const setRef = value as Function;
          setRef(el);
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
