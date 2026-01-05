import type { Props, Data, Methods, ComponentInstance } from "../utils/types";
import Parser, { type VNode } from "./parser";
import { createDOM } from "./renderer";
import { setCurrentFiber } from "./context";

type FiberOption = {
  key: string | number;
}

// todo 너무 fiber 역할이 많고 명확하지가 않다..
export default class Fiber {
  public instance: ComponentInstance<Props, Data, Methods>;
  
  public key: FiberOption['key'];

  private parentElement: Element;

  private prevVnodeTree: VNode;

  private nextVnodeTree: VNode;

  private prevDom: HTMLElement;

  private nextDom: HTMLElement;

  private mounted = false;

  constructor(instance: ComponentInstance<Props, Data, Methods>, options: FiberOption) {
    this.instance = instance;
    this.key = options.key;
    this.key;
  }

  // 초기 렌더
  public render(parentElement: Element) {
    const template = this.instance.template();
    const depth = Number(this.instance.$componentKey.match(/^\d+/)![0]);

    this.prevVnodeTree = new Parser(template, depth + 1).parse();
    this.parentElement = parentElement;

    this.prevDom = createDOM(this.prevVnodeTree, this.parentElement);
    this.parentElement.insertBefore(this.prevDom, null);

    // queueMicrotask 대체 방법???
    queueMicrotask(() => {
      if (!this.mounted) {
        this.instance.mounted?.();
        this.mounted = true;
      }
    });
  }

  public rerender() {
    const template = this.instance.template();
    const depth = Number(this.instance.$componentKey.match(/^\d+/)![0]);

    this.nextVnodeTree = new Parser(template, depth + 1).parse();

    this.nextDom = createDOM(this.nextVnodeTree, this.parentElement);
    this.prevDom.replaceWith(this.nextDom);

    this.prevDom = this.nextDom;

    queueMicrotask(() => {
      this.instance.updated?.();
    });
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
