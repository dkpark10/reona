import type { Props, Data, Methods, ComponentInstance, ComponentKey } from "../utils/types";
import Parser, { type VNode } from "./parser";
import { createDOM } from "./renderer";
import { getDepth } from "../../../shared";
import { instanceMap } from "./instances";

type FiberOption = {
  key: ComponentKey;
}

// todo 너무 fiber 역할이 많고 명확하지가 않다..
export default class Fiber {
  public instance: ComponentInstance<Props, Data, Methods>;

  public key: ComponentKey;

  public mounted = false;

  private parentElement: Element;

  private prevVnodeTree: VNode;

  private nextVnodeTree: VNode;

  private prevDom: HTMLElement;

  private nextDom: HTMLElement;

  constructor(instance: ComponentInstance<Props, Data, Methods>, options: FiberOption) {
    this.instance = instance;
    this.key = options.key;
    this.key;
  }

  // 초기 렌더
  public render(parentElement: Element) {
    const template = this.instance.template();
    const depth = getDepth(this.instance.$componentKey);

    const parser = new Parser(template, depth + 1);
    this.prevVnodeTree = parser.parse();
    this.parentElement = parentElement;

    this.prevDom = createDOM(this.prevVnodeTree, this.parentElement);
    this.parentElement.insertBefore(this.prevDom, null);

    // todo queueMicrotask 대체 방법???
    queueMicrotask(() => {
      if (!this.mounted) {
        this.instance.mounted?.();
        this.mounted = true;
      }
    });
  }

  public reRender() {
    const template = this.instance.template();
    const depth = getDepth(this.instance.$componentKey);

    const parser = new Parser(template, depth + 1);
    this.nextVnodeTree = parser.parse();

    this.ummount();

    this.nextDom = createDOM(this.nextVnodeTree, this.parentElement);
    this.prevDom.replaceWith(this.nextDom);

    this.prevVnodeTree = this.nextVnodeTree;
    this.prevDom = this.nextDom;

    queueMicrotask(() => {
      this.instance.updated?.();
    });
  }

  // todo 최적화 방법??
  private ummount() {
    const prevFibers = this.collectFibers(this.prevVnodeTree);
    const nextFibers = this.collectFibers(this.nextVnodeTree);

    const unmountFibers: Fiber[] = [];

    for (const fiber of prevFibers) {
      if (!nextFibers.has(fiber)) {
        unmountFibers.push(fiber);
      }
    }

    for (const fiber of unmountFibers) {
      fiber.instance.unMounted?.();
      instanceMap.delete(fiber.key);
    }
  }

  private collectFibers(
    vnode: VNode | undefined,
    set: Set<Fiber> = new Set()
  ): Set<Fiber> {
    if (!vnode) return set;

    switch (vnode.type) {
      case 'component':
        set.add(vnode.fiber);
        break;

      case 'element':
        vnode.children.forEach((child) => this.collectFibers(child, set));
        break;

      case 'text':
        break;
    }

    return set;
  }

  /**
   * todo
   *  @see {@link https://ko.legacy.reactjs.org/docs/reconciliation.html}
   *  */
  private reconciliate() {
    // 루트 엘리먼트 타입이 다르다면
    if (this.nextVnodeTree.type !== this.prevVnodeTree.type) {
      return;
    }
  }
}
