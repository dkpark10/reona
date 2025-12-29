import type { Props, Data, Methods, ComponentOptions } from "../utils/types";
import { Parser, type VNode } from "./parser";
import { createDOM } from "./renderer";

type Key = string | number;

// todo 너무 fiber 역할이 많고 명확하지가 않다..
export class Fiber {
  private key: Key;

  private instance: ComponentOptions<Props, Data, Methods>;

  private parentElement: Element;

  private prevVnodeTree: VNode;

  private nextVnodeTree: VNode;

  private prevDom: HTMLElement;

  private nextDom: HTMLElement;

  private mounted: boolean;

  constructor(instance: ComponentOptions<Props, Data, Methods>, key: Key) {
    this.instance = instance;
    this.key = key;
    this.key;
  }

  public getMounted() {
    return this.mounted;
  }

  // 초기 렌더
  public render(parentElement: Element) {
    const template = this.instance.template();
    const parser = new Parser(template);
    this.prevVnodeTree = parser.parse();
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
    const parser = new Parser(template);
    this.nextVnodeTree = parser.parse();

    this.reconciliation();

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
  private reconciliation() {
    // 루트 엘리먼트 타입이 다르다면
    if (this.nextVnodeTree.type !== this.prevVnodeTree.type) {
      return;
    }
  }
}
