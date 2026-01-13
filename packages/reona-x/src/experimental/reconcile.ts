/** @see {@link https://ko.legacy.reactjs.org/docs/reconciliation.html} */
import type { VNode, VElementNode, VTextNode, VComponent } from '../core/parser';
import type { Props } from '../utils/types';
import Fiber, { unMountHooks, mountHooks, updatedHooks, getInstanceMap } from '../core/fiber';

export function reconcile(
  prevVNode: VNode | null,
  nextVNode: VNode | null,
  dom: Node | null,
  parentElement: Element
): Node | null {
  // Case 1: 새 노드 추가
  if (prevVNode === null && nextVNode !== null) {
    const newDom = createDOMFromVNode(nextVNode, parentElement);
    if (newDom) {
      parentElement.appendChild(newDom);
    }
    return newDom;
  }

  // Case 2: 노드 삭제
  if (prevVNode !== null && nextVNode === null) {
    if (dom) {
      unmountVNode(prevVNode);
      dom.parentNode?.removeChild(dom);
    }
    return null;
  }

  // Case 3: 둘 다 null
  if (prevVNode === null || nextVNode === null || dom === null) {
    return null;
  }

  // Case 4: 타입이 다르면 전체 교체
  if (prevVNode.type !== nextVNode.type) {
    unmountVNode(prevVNode);
    const newDom = createDOMFromVNode(nextVNode, parentElement);
    if (newDom) {
      dom.parentNode?.replaceChild(newDom, dom);
    }
    return newDom;
  }

  // Case 5: 같은 타입 - 타입별 처리
  switch (nextVNode.type) {
    case 'text':
      return reconcileText(prevVNode as VTextNode, nextVNode, dom as Text);

    case 'element':
      return reconcileElement(
        prevVNode as VElementNode,
        nextVNode,
        dom as HTMLElement,
        parentElement
      );

    case 'component':
      return reconcileComponent(prevVNode as VComponent, nextVNode, dom, parentElement);

    default:
      return dom;
  }
}

/**
 * @description 텍스트 노드 reconciliation
 */
function reconcileText(prevVNode: VTextNode, nextVNode: VTextNode, dom: Text): Text {
  if (prevVNode.value !== nextVNode.value) {
    dom.textContent = nextVNode.value;
  }
  return dom;
}

/**
 * @description 엘리먼트 노드 reconciliation
 */
function reconcileElement(
  prevVNode: VElementNode,
  nextVNode: VElementNode,
  dom: HTMLElement,
  parentElement: Element
): HTMLElement {
  // 태그가 다르면 전체 교체
  if (prevVNode.tag !== nextVNode.tag) {
    unmountVNode(prevVNode);
    const newDom = createDOMFromVNode(nextVNode, parentElement) as HTMLElement;
    dom.parentNode?.replaceChild(newDom, dom);
    return newDom;
  }

  // 속성 diff & patch
  patchAttributes(dom, prevVNode.attr, nextVNode.attr);

  // 자식 노드 reconciliation
  reconcileChildren(prevVNode.children, nextVNode.children, dom);

  return dom;
}

/**
 * @description 컴포넌트 노드 reconciliation
 */
function reconcileComponent(
  prevVNode: VComponent,
  nextVNode: VComponent,
  dom: Node,
  parentElement: Element
): Node {
  // 같은 Fiber 인스턴스면 props만 업데이트하고 리렌더
  if (prevVNode.fiber === nextVNode.fiber) {
    // Fiber가 자체적으로 리렌더링 처리
    return dom;
  }

  // 다른 Fiber면 이전 것 언마운트하고 새로 마운트
  unmountFiber(prevVNode.fiber);
  nextVNode.fiber.render(parentElement);

  return dom;
}

/**
 * @description 속성 diff & patch
 */
function patchAttributes(
  dom: HTMLElement,
  prevAttrs: Props | undefined,
  nextAttrs: Props | undefined
): void {
  const prev = prevAttrs || {};
  const next = nextAttrs || {};

  // 이전 속성 중 삭제된 것 제거
  for (const key of Object.keys(prev)) {
    if (!(key in next)) {
      removeAttribute(dom, key, prev[key]);
    }
  }

  // 새 속성 추가 또는 업데이트
  for (const [key, value] of Object.entries(next)) {
    if (prev[key] !== value) {
      setAttribute(dom, key, value, prev[key]);
    }
  }
}

/**
 * @description 속성 제거
 */
function removeAttribute(dom: HTMLElement, key: string, value: any): void {
  // 이벤트 핸들러
  if (/@([^\s=/>]+)/.test(key) && typeof value === 'function') {
    const eventName = key.slice(1);
    dom.removeEventListener(eventName, value);
  }
  // ref는 제거하지 않음
  else if (!/^\$\$ref\b/.test(key)) {
    dom.removeAttribute(key);
  }
}

/**
 * @description 속성 설정
 */
function setAttribute(dom: HTMLElement, key: string, value: any, prevValue?: any): void {
  // 이벤트 핸들러
  if (/@([^\s=/>]+)/.test(key) && typeof value === 'function') {
    const eventName = key.slice(1);
    // 이전 핸들러 제거
    if (prevValue && typeof prevValue === 'function') {
      dom.removeEventListener(eventName, prevValue);
    }
    dom.addEventListener(eventName, value);
  }
  // ref
  else if (/^\$\$ref\b/.test(key)) {
    const setRef = value as Function;
    setRef(dom);
  }
  // 일반 속성
  else {
    dom.setAttribute(key, value);
  }
}

/**
 * @description 자식 노드 reconciliation (키 기반 + 인덱스 기반 혼합)
 */
function reconcileChildren(
  prevChildren: VNode[],
  nextChildren: VNode[],
  parentDom: HTMLElement
): void {
  const prevLen = prevChildren.length;
  const nextLen = nextChildren.length;
  const maxLen = Math.max(prevLen, nextLen);

  // DOM 인덱스 추적 (컴포넌트는 자체 DOM을 가지므로 별도 추적)
  let domIndex = 0;
  const domChildren = Array.from(parentDom.childNodes);

  // VNode별 DOM 매핑 구축
  const prevVNodeDomMap = new Map<VNode, Node>();
  for (let i = 0; i < prevLen; i++) {
    const prevChild = prevChildren[i];
    if (prevChild.type === 'component') {
      const dom = prevChild.fiber.getDom();
      if (dom) {
        prevVNodeDomMap.set(prevChild, dom);
        domIndex++;
      }
    } else {
      const dom = domChildren[domIndex];
      if (dom) {
        prevVNodeDomMap.set(prevChild, dom);
        domIndex++;
      }
    }
  }

  // 키 기반 매핑 (명시적 key가 있는 노드용)
  const prevKeyMap = new Map<string, { vnode: VNode; dom: Node; index: number }>();
  for (let i = 0; i < prevLen; i++) {
    const prevChild = prevChildren[i];
    const explicitKey = getExplicitKey(prevChild);
    if (explicitKey) {
      const dom = prevVNodeDomMap.get(prevChild);
      if (dom) {
        prevKeyMap.set(explicitKey, { vnode: prevChild, dom, index: i });
      }
    }
  }

  const usedPrevIndices = new Set<number>();
  const newDomOrder: Node[] = [];

  // 새 자식들 처리
  for (let i = 0; i < nextLen; i++) {
    const nextChild = nextChildren[i];
    const explicitKey = getExplicitKey(nextChild);

    let prevChild: VNode | null = null;
    let prevDom: Node | null = null;
    let prevIndex: number = -1;

    // 1. 명시적 key로 먼저 찾기
    if (explicitKey && prevKeyMap.has(explicitKey)) {
      const entry = prevKeyMap.get(explicitKey)!;
      prevChild = entry.vnode;
      prevDom = entry.dom;
      prevIndex = entry.index;
    }
    // 2. key가 없으면 같은 인덱스의 이전 노드 사용 (조건부 렌더링 대응)
    else if (i < prevLen && !usedPrevIndices.has(i)) {
      const candidate = prevChildren[i];
      // 명시적 key가 있는 노드는 인덱스 매칭에서 제외
      if (!getExplicitKey(candidate)) {
        prevChild = candidate;
        prevDom = prevVNodeDomMap.get(candidate) ?? null;
        prevIndex = i;
      }
    }

    if (prevIndex >= 0) {
      usedPrevIndices.add(prevIndex);
    }

    // reconcile 실행
    if (prevChild && prevDom) {
      // 같은 타입이면 업데이트
      if (isSameType(prevChild, nextChild)) {
        const updatedDom = reconcile(prevChild, nextChild, prevDom, parentDom);
        if (updatedDom) {
          newDomOrder.push(updatedDom);
        } else if (nextChild.type === 'component') {
          // 컴포넌트는 reconcile이 null을 반환할 수 있음
          const componentDom = nextChild.fiber.getDom();
          if (componentDom) {
            newDomOrder.push(componentDom);
          }
        }
      }
      // 다른 타입이면 교체
      else {
        unmountVNode(prevChild);

        // 이전 DOM 위치에 새 DOM 삽입
        if (nextChild.type === 'component') {
          // 컴포넌트: 이전 DOM 위치 기억 후 제거, 새 컴포넌트 렌더
          const nextSibling = prevDom.nextSibling;
          prevDom.parentNode?.removeChild(prevDom);
          nextChild.fiber.render(parentDom);
          const newDom = nextChild.fiber.getDom();
          if (newDom) {
            // 원래 위치로 이동 (render가 끝에 추가했으므로)
            if (nextSibling) {
              parentDom.insertBefore(newDom, nextSibling);
            }
            newDomOrder.push(newDom);
          }
        } else {
          // 일반 노드: 직접 교체
          const newDom = createDOMFromVNode(nextChild, parentDom);
          if (newDom) {
            prevDom.parentNode?.replaceChild(newDom, prevDom);
            newDomOrder.push(newDom);
          }
        }
      }
    }
    // 새 노드 생성
    else {
      if (nextChild.type === 'component') {
        nextChild.fiber.render(parentDom);
        const newDom = nextChild.fiber.getDom();
        if (newDom) {
          newDomOrder.push(newDom);
        }
      } else {
        const newDom = createDOMFromVNode(nextChild, parentDom);
        if (newDom) {
          parentDom.appendChild(newDom);
          newDomOrder.push(newDom);
        }
      }
    }
  }

  // 사용되지 않은 이전 노드들 제거
  for (let i = 0; i < prevLen; i++) {
    if (!usedPrevIndices.has(i)) {
      const prevChild = prevChildren[i];
      unmountVNode(prevChild);

      if (prevChild.type === 'component') {
        prevChild.fiber.removeDom();
      } else {
        const dom = prevVNodeDomMap.get(prevChild);
        dom?.parentNode?.removeChild(dom);
      }
    }
  }

  // DOM 순서 재정렬
  reorderChildren(parentDom, newDomOrder);
}

/**
 * @description 명시적 key 추출 (사용자가 지정한 key만)
 */
function getExplicitKey(vnode: VNode): string | null {
  if (vnode.type === 'element' && vnode.attr?.key) {
    return `key:${vnode.attr.key}`;
  }
  // 컴포넌트의 경우 props에서 key를 찾아야 함
  if (vnode.type === 'component' && vnode.fiber.props?.key) {
    return `key:${vnode.fiber.props.key}`;
  }
  return null;
}

/**
 * @description 두 VNode가 같은 타입인지 확인
 */
function isSameType(prev: VNode, next: VNode): boolean {
  if (prev.type !== next.type) return false;

  if (prev.type === 'element' && next.type === 'element') {
    return prev.tag === next.tag;
  }

  if (prev.type === 'component' && next.type === 'component') {
    // 같은 컴포넌트 함수인지 확인 (fiber.key로 판단)
    // fiber.key는 "depth-componentName" 형태이므로 componentName 부분 비교
    const prevName = prev.fiber.key.split('-').slice(1).join('-');
    const nextName = next.fiber.key.split('-').slice(1).join('-');
    return prevName === nextName;
  }

  return true;
}

/**
 * @description DOM 자식 순서 재정렬
 */
function reorderChildren(parentDom: HTMLElement, newOrder: Node[]): void {
  for (let i = 0; i < newOrder.length; i++) {
    const node = newOrder[i];
    const currentNode = parentDom.childNodes[i];

    if (node !== currentNode) {
      if (currentNode) {
        parentDom.insertBefore(node, currentNode);
      } else {
        parentDom.appendChild(node);
      }
    }
  }
}

/**
 * @description VNode 언마운트 (cleanup)
 */
function unmountVNode(vnode: VNode): void {
  switch (vnode.type) {
    case 'component':
      unmountFiber(vnode.fiber);
      break;
    case 'element':
      vnode.children.forEach(unmountVNode);
      break;
    case 'text':
      // 텍스트 노드는 cleanup 불필요
      break;
  }
}

/**
 * @description Fiber 언마운트
 */
function unmountFiber(fiber: Fiber): void {
  const dep = unMountHooks.get(fiber);
  if (dep) {
    for (const fn of dep) {
      fn();
    }
  }

  const instanceMap = getInstanceMap();
  // @ts-ignore - component is private but we need access for cleanup
  const component = (fiber as any).component;
  instanceMap.get(component)?.delete(fiber.key);

  mountHooks.delete(fiber);
  unMountHooks.delete(fiber);
  updatedHooks.delete(fiber);
}

/**
 * @description VNode로부터 DOM 생성 (runtime-dom.ts의 createDOM과 유사하지만 분리)
 */
function createDOMFromVNode(vnode: VNode, parentElement: Element): Node | null {
  if (vnode.type === 'text') {
    return document.createTextNode(vnode.value);
  }

  if (vnode.type === 'component') {
    const fiber = vnode.fiber;
    fiber.render(parentElement);
    return null;
  }

  // DocumentFragment (tag 없는 루트)
  if (!vnode.tag) {
    const fragment = document.createDocumentFragment();
    vnode.children?.forEach((child) => {
      const dom = createDOMFromVNode(child, parentElement);
      if (dom) {
        fragment.appendChild(dom);
      }
    });
    return fragment;
  }

  const el = document.createElement(vnode.tag);

  if (vnode.attr) {
    for (const [key, value] of Object.entries(vnode.attr)) {
      setAttribute(el, key, value);
    }
  }

  vnode.children?.forEach((child) => {
    const childDom = createDOMFromVNode(child, el);
    if (childDom) {
      el.appendChild(childDom);
    }
  });

  return el;
}

/**
 * @description VNode와 DOM을 매핑하는 헬퍼 (초기 렌더 후 사용)
 */
export function buildDomMap(vnode: VNode, dom: Node): Map<VNode, Node> {
  const map = new Map<VNode, Node>();
  buildDomMapRecursive(vnode, dom, map);
  return map;
}

function buildDomMapRecursive(vnode: VNode, dom: Node, map: Map<VNode, Node>): void {
  map.set(vnode, dom);

  if (vnode.type === 'element' && dom instanceof HTMLElement) {
    const domChildren = Array.from(dom.childNodes);
    let domIndex = 0;

    for (const childVNode of vnode.children) {
      if (childVNode.type === 'component') {
        // 컴포넌트는 자체 DOM을 관리
        continue;
      }

      if (domIndex < domChildren.length) {
        buildDomMapRecursive(childVNode, domChildren[domIndex], map);
        domIndex++;
      }
    }
  }
}
