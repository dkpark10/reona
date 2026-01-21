import ComponentInstance from "./component-instance";
import { createComponent } from ".";

export function rootRender(
  container,
  component,
  options,
) {
  if (!component) {
    throw new Error('컴포넌트가 없습니다.');
  }

  const getInstance = createComponent(component, {
    props: options?.props,
  });

  const instance = getInstance(0);
  instance.render(container);
  return instance;
}

export function createDOM(vnode, parentElement) {
  if (vnode.type === 'text') {
    return document.createTextNode(vnode.value);
  }

  if (vnode.type === 'component') {
    const instance = vnode.instance;
    instance.render(parentElement, true);
    return null;
  }

  const el = document.createElement(vnode.tag);
  if (vnode.attr) {
    for (const [key, value] of Object.entries(vnode.attr)) {
      if (/@([^\s=/>]+)/.test(key) && typeof value === 'function') {
        const eventName = key.slice(1);
        el.addEventListener(eventName, value);
      } else {
        el.setAttribute(key, value);
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
