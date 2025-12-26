import type {
  RenderResult,
  Component,
  Props,
  LifeCycleType,
} from "../utils/types";
import { effect, reactive } from "./reactivity";
import { isHtmlString } from "../utils";

/** @description 전역 컴포넌트 관리 map */
const componentsMap = new WeakMap<Component, Fiber>();

/** @description 함수형 컴포넌트에서 재호출 시 싱글톤을 유지하기 위한 상태 리스트 */
let componentCount = 0;
/** todo 컴포넌트 하나당 상태 함수 하나로 강제하기 */
const stateList = new Map<number, Record<string, any>>();

const lifeCycleCallbacks = new Map<number, Map<LifeCycleType, () => void>>();

export function state<T extends Record<string, any>>(initial: T) {
  if (stateList.has(componentCount)) {
    return stateList.get(componentCount) as T;
  }

  const data = reactive(initial);
  stateList.set(componentCount, data);
  return data;
}

export function rootRender(
  container: Element,
  component: Component,
  props?: Parameters<typeof component>[0]
) {
  const fiber = regist({
    component,
    props,
  });

  container.appendChild(fiber.getFragment());
}

export function regist({
  component,
  key = "default",
  props,
}: {
  component: Component;
  key?: string;
  props?: Props;
}) {
  let fiber = componentsMap.get(component);

  if (!fiber) {
    // @ts-ignore
    component.componentId = componentCount++;
    fiber = new Fiber(component, key, props);
    componentsMap.set(component, fiber);
  }
  return fiber;
}

export class Fiber {
  private key: string;

  private instance: Component;

  private props: Props | undefined;

  private fragment: DocumentFragment;

  private boundaryStart: Comment;

  private boundaryEnd: Comment;

  constructor(instance: Component, key: string, props?: Props) {
    this.instance = instance;
    this.key = key;
    this.props = props;
    this.initialize();
  }

  public initialize() {
    effect(() => {
      const result = this.instance(this.props);
      this.fragment = createFragmentElement(result.template);

      if (!this.boundaryStart || !this.boundaryEnd) {
        this.boundaryStart =
          this.boundaryStart ?? document.createComment(`${this.key}:start`);
        this.boundaryEnd =
          this.boundaryEnd ?? document.createComment(`${this.key}:end`);

        this.fragment.prepend(this.boundaryStart);
        this.fragment.append(this.boundaryEnd);
        processMarkers(this.fragment, result.values);
        return;
      }

      this.rerender(result);
    });

    queueMicrotask(() => {
      lifeCycleCallbacks.get(componentCount)?.get("mounted")?.();
    });
  }

  public rerender(result: RenderResult) {
    this.fragment = createFragmentElement(result.template);
    processMarkers(this.fragment, result.values);

    let node = this.boundaryStart.nextSibling;
    while (node && node !== this.boundaryEnd) {
      const next = node.nextSibling;
      node.remove();
      node = next;
    }

    this.boundaryEnd.before(this.fragment);
    queueMicrotask(() => {
      lifeCycleCallbacks.get(componentCount)?.get("updated")?.();
    });
  }

  public getFragment() {
    return this.fragment;
  }
}

export function html(
  strings: TemplateStringsArray,
  ...values: any[]
): RenderResult {
  let idx = 0;
  const rawString = strings
    .join("%%identifier%%")
    .replace(/%%identifier%%/g, () => `__marker_${idx++}__`);

  if (!isHtmlString(rawString)) throw new Error("잘못된 html 형식입니다.");
  return { template: rawString, values };
}

export function createFragmentElement(html: string) {
  const template = document.createElement("template");
  template.innerHTML = html.trim();
  return template.content;
}

export function handleAttributes(el: Element, values: any[]) {
  [...el.attributes].forEach((attr) => {
    const match = attr.value.match(/__marker_(\d+)__/);
    if (!match) return;

    const value = values[Number(match[1])];

    if (/@([^\s=/>]+)/.test(attr.name) && typeof value === "function") {
      el.addEventListener(attr.name.slice(1), value);
      el.removeAttribute(attr.name);
      return;
    }

    el.setAttribute(attr.name, String(value));
  });
}

/** @description 마커표시된 텍스트 엘리먼트만을 수집하는 함수 */
function collectTextMarkers(root: DocumentFragment): Text[] {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);

  const nodes: Text[] = [];
  let node: Node | null;

  while ((node = walker.nextNode())) {
    if (/__marker_\d+__/.test(node.textContent ?? "")) {
      nodes.push(node as Text);
    }
  }

  return nodes;
}

export function processMarkers(fragment: DocumentFragment, values: any[]) {
  const walker = document.createTreeWalker(fragment, NodeFilter.SHOW_ELEMENT);

  let el: Node | null;
  while ((el = walker.nextNode())) {
    /** @description 이벤트 핸들러 및 속성을 부착함 */
    handleAttributes(el as Element, values);
  }

  const textNodes = collectTextMarkers(fragment);

  for (const textNode of textNodes) {
    const content = textNode.textContent ?? "";

    const parts = content.split(/(__marker_\d+__)/g);
    const fragment = document.createDocumentFragment();

    for (const part of parts) {
      const match = part.match(/__marker_(\d+)__/);

      if (match) {
        const value = values[Number(match[1])];

        /** @desc todo 컴포넌트 일 시 */
        if (false) {
          const res = value.render();
          const frag = createFragmentElement(res.template);
          processMarkers(frag, res.values);
          fragment.appendChild(frag);

          queueMicrotask(() => {
            value.__mounted?.();
          });
        } else if (value instanceof Node) {
          /** @desc DOM 일 시 */
          fragment.appendChild(value);
        } else {
          /** @desc 원시객체일 시 */
          fragment.appendChild(document.createTextNode(String(value)));
        }
      } else {
        fragment.appendChild(document.createTextNode(part));
      }
    }

    textNode.replaceWith(fragment);
  }
}

export function mounted(callback: () => void) {
  if (!lifeCycleCallbacks.get(componentCount)?.get("mounted")) {
    let mp = lifeCycleCallbacks.get(componentCount);
    if (!mp) {
      mp = new Map();
    }
    mp.set("mounted", callback);
    lifeCycleCallbacks.set(componentCount, mp);
  }
}

export function updated(callback: () => void) {
  if (!lifeCycleCallbacks.get(componentCount)?.get("updated")) {
    let mp = lifeCycleCallbacks.get(componentCount);
    if (!mp) {
      mp = new Map();
    }
    mp.set("updated", callback);
    lifeCycleCallbacks.set(componentCount, mp);
  }
}

export function unmounted(callback: () => void) {
  if (!lifeCycleCallbacks.get(componentCount)?.get("unmounted")) {
    let mp = lifeCycleCallbacks.get(componentCount);
    if (!mp) {
      mp = new Map();
    }
    mp.set("unmounted", callback);
    lifeCycleCallbacks.set(componentCount, mp);
  }
}
