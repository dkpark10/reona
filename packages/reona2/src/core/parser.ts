import type { RenderResult, Props } from "@/utils/types";

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

export type VNode = VTextNode | VElementNode;

export class Parser {
  private renderResult: RenderResult;

  private valueIndex = 0;

  constructor(renderResult: RenderResult) {
    this.renderResult = renderResult;
  }

  public parse(): VNode {
    const { doc } = this.renderResult;
    const root = doc.body.firstElementChild!;
    return this.convertNode(root);
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
      if (vnode) children.push(vnode);
    }

    return {
      type: 'element',
      tag: node.tagName.toLowerCase() as keyof HTMLElementTagNameMap,
      attr: attrs,
      children,
    };
  }

  private convertChild(node: ChildNode): VNode | null {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent ?? "";

      /** @description 공백 제거 */
      if (/^\s*$/.test(text)) return null;

      if (/__marker_(\d+)__/.test(text)) {
        const { values } = this.renderResult;
        const markerText = text.replace(/__marker_(\d+)__/, values[this.valueIndex]);
        this.valueIndex++;
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
