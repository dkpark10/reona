/** @see {@link https://ko.legacy.reactjs.org/docs/reconciliation.html} */
import type { VNode, VElementNode, VTextNode } from '../core/parser';
import { shallowEqual } from '../../../shared';
import { Fiber } from '../core';
import { createDOM } from '../core/runtime-dom';

/**
 *
 *
  1. 최상위 노드 타입이 다름 (일괄 교체)

  text → element
  text → component
  element → text
  element → component
  component → text
  component → element

  2. Text Node

  "hello" → "world"  // value 변경

  3. Element Node

  3-1. Tag 변경 (일괄 교체)

  <div> → <span>
  <ul> → <ol>

  3-2. Attr 변경

  <div id="1"> → <div id="2">           // 값 변경
  <div id="1"> → <div>                   // attr 삭제
  <div> → <div id="1">                   // attr 추가
  <div class="a" id="1"> → <div id="1">  // 일부 삭제
  <button onClick={fn1}> → <button onClick={fn2}>  // 이벤트 핸들러 변경

  3-3. Children 개수 변경

  <ul><li>1</li></ul> → <ul><li>1</li><li>2</li></ul>  // 추가
  <ul><li>1</li><li>2</li></ul> → <ul><li>1</li></ul>  // 삭제

  3-4. Children 타입 변경

  <div>text</div> → <div><span>text</span></div>      // text → element
  <div><Comp /></div> → <div>text</div>               // component → text

  4. Component Node

  <Comp1 /> → <Comp2 />  // 다른 컴포넌트 (일괄 교체)

  5. 중첩 케이스

  5-1. 깊은 text 변경

  <div><span><p>1</p></span></div>
  →
  <div><span><p>2</p></span></div>

  5-2. 깊은 attr 변경

  <div><span class="a">1</span></div>
  →
  <div><span class="b">1</span></div>

  5-3. 깊은 tag 변경 (해당 subtree 교체)

  <div><span>1</span></div>
  →
  <div><p>1</p></div>

  5-4. 복합 변경

  <div id="1">
    <span class="s">1</span>
    <p>hello</p>
  </div>
  →
  <div id="2">
    <span class="s">2</span>
    <p>world</p>
  </div>
  // attr 변경 + 여러 text 변경

  5-5. 중첩된 컴포넌트

  <div><Comp1 /></div>
  →
  <div><Comp2 /></div>

  5-6. 배열/리스트 (key 관련)

  <ul>
    <li key="a">A</li>
    <li key="b">B</li>
  </ul>
  →
  <ul>
    <li key="b">B</li>
    <li key="a">A</li>
  </ul>
  // 순서 변경 
 */

export function reconcile(fiber: Fiber) {
  const prevVnodeTree = fiber.prevVnodeTree;
  const nextVnodeTree = fiber.nextVnodeTree;

  if (prevVnodeTree.type !== nextVnodeTree.type) {
    batchReplace(fiber);
    return;
  }

  /**
   * native tag가 아닌 fiber 변경 시 일괄교체
   * ex) html`${condition ? createComponent(comp1) : createComponent(comp2)}`
   */
  if (prevVnodeTree.type === 'component' && nextVnodeTree.type === 'component') {
    if (prevVnodeTree.fiber !== nextVnodeTree.fiber) {
      batchReplace(fiber);
      return;
    }
  }

  /**
   * native tag값 변경의 경우 일괄 교체
   * ex) html`${condition ? <div /> : </article />}`
   */
  if (prevVnodeTree.type === 'element' && nextVnodeTree.type === 'element') {
    if (prevVnodeTree.tag !== nextVnodeTree.tag) {
      batchReplace(fiber);
      return;
    }
  }

  recursiveDiff(prevVnodeTree, nextVnodeTree, fiber.parentElement);

  // todo remove
  batchReplace(fiber);
}

function recursiveDiff(prevVnodeTree: VNode, nextVnodeTree: VNode, parentElement: Element) {
  if (prevVnodeTree.type !== nextVnodeTree.type) {
    const dom = createDOM(nextVnodeTree, parentElement);
    parentElement.replaceWith(dom);
    return;
  }

  if (prevVnodeTree.type === 'component' && nextVnodeTree.type === 'component') {
    if (prevVnodeTree.fiber !== nextVnodeTree.fiber) {
      const dom = createDOM(nextVnodeTree, parentElement);
      parentElement.replaceWith(dom);
      return;
    }
  }

  if (prevVnodeTree.type === 'element' && nextVnodeTree.type === 'element') {
    if (prevVnodeTree.tag !== nextVnodeTree.tag) {
      const dom = createDOM(nextVnodeTree, parentElement);
      parentElement.replaceWith(dom);
      return;
    }
  }

  changeAttribute(prevVnodeTree, nextVnodeTree, parentElement);
}


function changeAttribute(prevVnodeTree: VNode, nextVnodeTree: VNode, parentElement: Element) {
  if (prevVnodeTree.type !== 'element' || nextVnodeTree.type !== 'element') {
    return;
  }

  if (!shallowEqual(nextVnodeTree.attr, prevVnodeTree.attr)) {
    Object.values(nextVnodeTree.attr || {}).forEach(([name, value]) => {
      parentElement.setAttribute(name, value);
    });
  }
}

// 일괄 dom 전체 교체
function batchReplace(fiber: Fiber) {
  const dom = createDOM(fiber.nextVnodeTree, fiber.parentElement);
  fiber.currentDom.replaceWith(dom);

  fiber.prevVnodeTree = fiber.nextVnodeTree;
  fiber.currentDom = dom;
}

function reconcileTextNodes(
  prevVnode: VElementNode,
  nextVnode: VElementNode,
  dom: HTMLElement,
) {
  if (!isSameElement(prevVnode, nextVnode)) {
    return false;
  }

  const prevChildren = prevVnode.children;
  const nextChildren = nextVnode.children;

  if (prevChildren.length !== nextChildren.length) {
    return false;
  }

  for (let i = 0; i < prevChildren.length; i++) {
    const prevChild = prevChildren[i];
    const nextChild = nextChildren[i];

    if (prevChild.type === 'text' && nextChild.type === 'text') {
      if (prevChild.value !== nextChild.value) {
        const textNode = dom.childNodes[i];
        if (textNode && textNode.nodeType === Node.TEXT_NODE) {
          textNode.textContent = nextChild.value;
        }
      }
    }

    if (prevChild.type === 'element' && nextChild.type === 'element') {
      const childDom = dom.childNodes[i] as HTMLElement;
      if (childDom && childDom.nodeType === Node.ELEMENT_NODE) {
        reconcileTextNodes(prevChild, nextChild, childDom);
      }
    }
  }

  return true;
}

function isSameElement(prevVnode: VElementNode, nextVnode: VElementNode) {
  const sameTag = prevVnode.tag === nextVnode.tag;
  const sameAttr = shallowEqual(prevVnode.attr, nextVnode.attr);
  return sameTag && sameAttr;
}
