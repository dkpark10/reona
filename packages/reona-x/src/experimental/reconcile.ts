/** @see {@link https://ko.legacy.reactjs.org/docs/reconciliation.html} */
import type { VNode, VElementNode } from '../core/parser';
import { shallowEqual } from '../../../shared';
import ComponentInstance from '../core/component-instance';
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

  6. 길이 변경

  6-1 추가
  <ul>
    <li>A</li>
    <li>B</li>
  </ul>

  <ul>
    <li>A</li>
    <li>B</li>
    <li>C</li>  // 새로 추가
  </ul>

  6-2 삭제
  <ul>
    <li>A</li>
    <li>B</li>
    <li>C</li>
  </ul>

  // next
  <ul>
    <li>A</li>
    <li>B</li>
    // C는 삭제됨
  </ul>

  6-3 복합
  <div>
    <span>Hello</span>
    <p>World</p>
  </div>

  // next
  <div>
    <span>Hi</span>      // 텍스트 변경
    <p>World</p>
    <button>Click</button>  // 새로 추가
  </div>
 */

export function reconcile(instance: ComponentInstance) {
  const prevVnodeTree = instance.prevVnodeTree;
  const nextVnodeTree = instance.nextVnodeTree;

  if (prevVnodeTree.type !== nextVnodeTree.type) {
    batchReplace(instance);
    return;
  }

  /**
   * native tag가 아닌 instance 변경 시 일괄교체
   * ex) html`${condition ? createComponent(comp1) : createComponent(comp2)}`
   */
  if (prevVnodeTree.type === 'component' && nextVnodeTree.type === 'component') {
    if (prevVnodeTree.instance !== nextVnodeTree.instance) {
      batchReplace(instance);
      return;
    }
  }

  /**
   * native tag값 변경의 경우 일괄 교체
   * ex) html`${condition ? <div /> : </article />}`
   */
  if (prevVnodeTree.type === 'element' && nextVnodeTree.type === 'element') {
    if (prevVnodeTree.tag !== nextVnodeTree.tag) {
      batchReplace(instance);
      return;
    }
  }

  const newDom = recursiveDiff(prevVnodeTree, nextVnodeTree, instance.currentDom, instance.parentElement);
  if (newDom) {
    instance.currentDom = newDom as HTMLElement;
  }
  instance.prevVnodeTree = nextVnodeTree;
}

function recursiveDiff(
  prevVnodeTree: VNode,
  nextVnodeTree: VNode,
  currentElement: Element | null,
  parentElement: Element | null): Element | null {
  if (prevVnodeTree.type === 'component' && nextVnodeTree.type === 'component' && parentElement) {
    if (prevVnodeTree.instance !== nextVnodeTree.instance) {
      createDOM(nextVnodeTree, parentElement);
      if (currentElement) {
        currentElement.replaceWith(nextVnodeTree.instance.currentDom);
      }
      return nextVnodeTree.instance.currentDom;
    }

    // 자식 리렌더링
    nextVnodeTree.instance.reRender();
    return null;
  }

  if (prevVnodeTree.type !== nextVnodeTree.type && parentElement) {
    const dom = createDOM(nextVnodeTree, parentElement);
    if (currentElement) {
      currentElement.replaceWith(dom);
    }
    return dom;
  }

  if (prevVnodeTree.type === 'element' && nextVnodeTree.type === 'element' && parentElement) {
    if (prevVnodeTree.tag !== nextVnodeTree.tag) {
      const dom = createDOM(nextVnodeTree, parentElement);
      if (currentElement) {
        currentElement.replaceWith(dom);
      }
      return dom;
    }
  }

  changeAttribute(prevVnodeTree, nextVnodeTree, currentElement);
  changeText(prevVnodeTree, nextVnodeTree, currentElement);

  const next = nextVnodeTree as VElementNode;
  const prev = prevVnodeTree as VElementNode;

  if (!next.children || !prev.children) {
    return null;
  }

  const prevLen = prev.children.length;
  const nextLen = next.children.length;

  if (prevLen > nextLen) {
    let gap = prevLen - nextLen;
    while (currentElement?.lastElementChild && gap) {
      currentElement.lastElementChild.remove();
      gap--;
    }
  }

  const fragment = document.createDocumentFragment();
  for (let i = 0; i < nextLen; i++) {
    const childOfPrev = prev.children[i];
    const childOfNext = next.children[i];
    const childDom = currentElement?.childNodes[i] as HTMLElement;

    // 이전 노드에서 추가된 경우
    if (!childOfPrev && childOfNext) {
      if (childOfNext.type === 'element') {
        fragment.appendChild(createDOM(childOfNext as VNode));
        continue;
      }

      if (childOfNext.type === 'component') {
        if (currentElement) {
          createDOM(childOfNext, currentElement);
          continue;
        }
      }
    }
    recursiveDiff(childOfPrev, childOfNext, childDom, currentElement);
  }
  currentElement?.insertBefore(fragment, null);

  return null;
}

function changeAttribute(prevVnodeTree: VNode, nextVnodeTree: VNode, currentElement: Element | null) {
  if (!currentElement) return;
  if (prevVnodeTree.type === 'element' && nextVnodeTree.type === 'element') {
    if (!shallowEqual(nextVnodeTree.attr, prevVnodeTree.attr)) {
      Object.entries(nextVnodeTree.attr || {}).forEach(([name, value]) => {
        if (typeof value === 'string') {
          currentElement.setAttribute(name, value);
        }
      });
    }
  }
}

function changeText(prevVnode: VNode, nextVnode: VNode, currentElement: Element | null) {
  if (!currentElement) return;
  if (prevVnode.type === 'text' && nextVnode.type === 'text') {
    if (prevVnode.value !== nextVnode.value) {
      currentElement.textContent = nextVnode.value;
    }
  }
}

// 일괄 dom 전체 교체
function batchReplace(instance: ComponentInstance) {
  const dom = createDOM(instance.nextVnodeTree, instance.parentElement);
  instance.currentDom.replaceWith(dom);

  instance.prevVnodeTree = instance.nextVnodeTree;
  instance.currentDom = dom;
}
