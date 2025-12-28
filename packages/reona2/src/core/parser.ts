import type { RenderResult, Props } from "@/utils/types";
import { Fiber } from "./fiber";
import { isEmpty } from "../../../shared";

export type VTextNode = {
  type: 'text';
  value: string;
}

export type VElementNode = {
  type: 'element';
  tag: keyof HTMLElementTagNameMap;
  attr?: Props;
  children: VNode[];
}

// fiber
export type VComponent = {
  type: 'component';
  value: Fiber;
}

export type VNode = VTextNode | VElementNode;

/** @description 받은 html을 vnode tree로 만듬 */
export class Parser {
  private renderResult: RenderResult;

  private valueIndex = 0;

  constructor(renderResult: RenderResult) {
    this.renderResult = renderResult;
  }

  public parse(): VNode {
    const { template: t } = this.renderResult;
    const template = document.createElement("template");

    template.innerHTML = t.trim();

    if(template.content.childNodes.length > 1) {
      throw new Error('루트 엘리먼트는 1개여야 합니다.');
    }
    return this.convertNode(template.content.firstElementChild!);
  }

  private convertNode(node: Element): VElementNode {
    const attrs: Props = {};

    for (const attr of node.attributes) {
      const { values } = this.renderResult;

      /** @description attr에 이벤트 할당 */
      if (/__marker_(\d+)__/.test(attr.value)) {
        attrs[attr.name] = values[this.valueIndex];
        this.valueIndex++;
      } else {
        attrs[attr.name] = attr.value;
      }
    }

    const children: VNode[] = [];
    for (const child of node.childNodes) {
      const vnode = this.convertChild(child);
      if (vnode) {
        children.push(vnode);
      }
    }

    return {
      type: 'element',
      tag: node.tagName.toLowerCase() as keyof HTMLElementTagNameMap,
      children,
      ...(!isEmpty(attrs) && { attr: attrs}),
    };
  }

  private convertChild(node: ChildNode): VNode | null {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent ?? "";

      /** @description 공백 제거 */
      if (/^\s*$/.test(text)) return null;

      if (/__marker_(\d+)__/.test(text)) {
        const { values } = this.renderResult;

        // fiber 인스턴스라면
        if (values[this.valueIndex] instanceof Fiber) {
          const fiber: Fiber = values[this.valueIndex++];
          const parser = new Parser(fiber.getInstance().render());
          return parser.parse();
        }

        const markerText = text.replace(/__marker_(\d+)__/, values[this.valueIndex++]);
        return {
          type: "text",
          value: markerText,
        };
      }
      return {
        type: "text",
        value: text
      };
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      return this.convertNode(node as Element);
    }

    return null;
  }
}

class VnodeItem {
  private children: VnodeItem[] = [];

  private type: 'element' | 'text';

  private attr: Props = {};

  private tag: keyof HTMLElementTagNameMap;

  private value: string;

  constructor(
    tag: keyof HTMLElementTagNameMap,
    type: 'element' | 'text',
    children?: VnodeItem[],
    attr?: Props,
    value?: string
  ) {
    this.tag = tag;
    this.type = type;
    if (children) {
      this.children = children;
    }
    if (attr) {
      this.attr = attr;
    }
    if (value) {
      this.value = value;
    }
    this.children;
    this.type;
    this.attr;
    this.tag;
    this.value;
  }
}
