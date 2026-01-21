import Parser from './parser';
import { createDOM } from './runtime-dom';

/** @description 현재 렌더링 되고 있는 컴포넌트 */
let currentInstance = null;
export function getCurrentInstance() {
  return currentInstance;
}

/** @description 컴포넌트 인스턴스 - 상태, Props, 생명주기, VNode 트리, DOM 참조를 관리 */
export default class ComponentInstance {
  /** @type {HTMLElement | null} */
  parentElement;

  /** @type {Function} */
  component;

  /** @type {Object | null} */
  prevVnodeTree;

  /** @type {Object | null} */
  nextVnodeTree;

  /** @type {HTMLElement | null} */
  currentDom;

  /** @type {Number} html 트리에서의 위치 */
  sequence;

  hookIndex = 0;

  hookLimit = 0;

  stateHookIndex = 0;

  constructor(component, options) {
    this.component = component;
    this.sequence = options.sequence;
  }

  hookIndexInitialize() {
    this.stateHookIndex = 0;
  }

  render(parentElement, isRerender) {
    // 부모 리렌더링으로 인한 자식 리렌더링이라면
    if (isRerender) {
      this.hookIndexInitialize();
    }

    /** @description 현재 렌더링 되고 있는 컴포넌트를 할당 */
    currentInstance = this;
    const template = this.component();
    const parser = new Parser(template, this.sequence + 1);

    this.parentElement = parentElement;
    this.prevVnodeTree = parser.parse();

    this.currentDom = createDOM(this.prevVnodeTree, parentElement);
    parentElement.insertBefore(this.currentDom, null);
  }

  reRender() {
    this.hookIndexInitialize();
    currentInstance = this;
    const template = this.component();

    const parser = new Parser(template, this.sequence + 1);
    this.nextVnodeTree = parser.parse();

    const newDom = createDOM(this.nextVnodeTree, this.parentElement);
    this.currentDom.replaceWith(newDom);

    // 새로운 값들을 이전 변수에 할당
    this.currentDom = newDom;
    this.prevVnodeTree = this.nextVnodeTree;
  }
}
