import type { RenderResult, Props } from "@/utils/types";
import Fiber from "./fiber";
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
  fiber: Fiber;
}

export type VNode = VTextNode | VElementNode | VComponent;

/** @description 받은 html을 vnode tree로 만듬 */
export default class Parser {
  private renderResult: RenderResult;

  private valueIndex = 0;

  constructor(renderResult: RenderResult) {
    this.renderResult = renderResult;
    return this;
  }

  public parse(): VNode {
    const { template: t } = this.renderResult;
    const template = document.createElement("template");

    template.innerHTML = t.trim();

    if (template.content.childNodes.length > 1) {
      throw new Error('루트 엘리먼트는 1개여야 합니다.');
    }
    return this.convertNode(template.content.firstElementChild!);
  }

  private convertNode(node: Element): VElementNode {
    const attrs: Props = {};

    for (const attr of node.attributes) {
      const { values } = this.renderResult;

      // attr에 이벤트 할당
      const markers = attr.value.match(/__marker_(\d+)__/g);
      if (markers && markers.length >= 1) {
        if (typeof values[this.valueIndex] === 'function') {
          attrs[attr.name] = values[this.valueIndex++];
        } else {
          attrs[attr.name] = markers.reduce((acc) => {
            return acc += values[this.valueIndex++]
          }, '');
        }
      } else {
        attrs[attr.name] = attr.value;
      }
    }

    const children: VNode[] = [];
    for (const child of node.childNodes) {
      const vnode = this.convertChild(child);
      if (vnode) {
        if (Array.isArray(vnode)) {
          const filteredEmptyTextValue = vnode.filter((node) => !!node);
          children.push(...filteredEmptyTextValue);
        } else {
          children.push(vnode);
        }
      }
    }

    return {
      type: 'element',
      tag: node.tagName.toLowerCase() as keyof HTMLElementTagNameMap,
      children,
      ...(!isEmpty(attrs) && { attr: attrs }),
    };
  }

  private convertChild(node: ChildNode): VNode | Array<VNode | null> | null {
    if (node.nodeType === Node.TEXT_NODE) {
      let text = node.textContent ?? "";

      // 공백제거
      if (/^\s*$/.test(text)) return null;

      // marker가 붙어있는 경우가 있으므로 match
      const markers = text.match(/__marker_(\d+)__/g);
      if (markers && markers.length >= 1) {
        return markers.map(() => {
          const { values } = this.renderResult;

          // fiber 인스턴스라면
          if (values[this.valueIndex] instanceof Fiber) {
            const fiber: Fiber = values[this.valueIndex++];
            return {
              type: 'component',
              fiber,
            };
          }

          // marker 가 있다면 원본 텍스트를 변경한다.
          if (/__marker_(\d+)__/.test(text)) {
            text = this.replaceMarkers(text);
            return {
              type: "text",
              value: text,
            };
          }
          // marker 가 없으면 빈 텍스트 반환
          return null;
        });
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

  public replaceMarkers(str: string): string {
    const { values } = this.renderResult;
    return str.replace(/__marker_(\d+)__/g, () => {
      const v = values[this.valueIndex++];
      return v !== undefined ? String(v) : "";
    });
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
