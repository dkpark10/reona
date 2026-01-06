import type { RenderResult, Props, ComponentKey } from "../utils/types";
import Fiber from "./fiber";
import { isEmpty } from "../../../shared";
import { isRenderResultObject } from "../utils";

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
  
  private depth: number | undefined;
  
  public currentRenderedInstamces = new Set<ComponentKey>();
  
  constructor(renderResult: RenderResult, depth?: number) {
    this.renderResult = renderResult;
    this.depth = depth;
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

  private convertNode(el: Element): VElementNode {
    const attrs: Props = {};

    for (const attr of el.attributes) {
      const { values } = this.renderResult;

      // attr에 이벤트 할당
      const markers = attr.value.match(/__marker_(\d+)__/g);
      if (markers && markers.length >= 1) {
        if (typeof values[this.valueIndex] === 'function') {
          attrs[attr.name] = values[this.valueIndex++];
        } else if (typeof values[this.valueIndex] === 'object') {
          attrs[attr.name] = values[this.valueIndex++];
          console.warn(
            `${el.tagName.toLowerCase()} 엘리먼트에 ${attr.name} 속성에 ${values[this.valueIndex - 1]} 객체가 들어가 있습니다. 값이 맞는지 확인하세요.`
          );
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
    for (const child of el.childNodes) {
      const vnode = this.convertChild(child);
      if (vnode) {
        if (Array.isArray(vnode)) {
          const filteredEmptyTextValue = vnode.filter((node) => !!node).flat();
          children.push(...filteredEmptyTextValue);
        } else {
          children.push(vnode);
        }
      }
    }

    return {
      type: 'element',
      tag: el.tagName.toLowerCase() as keyof HTMLElementTagNameMap,
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
          const value = values[this.valueIndex];

          // createComponent 반환 함수일 시
          if (typeof value === 'function' && value.__isCreateComponent) {
            const getFiber = value as (depth: number) => Fiber;
            const fiber = getFiber(this.depth!);

            this.currentRenderedInstamces.add(fiber.instance.$componentKey);

            this.depth!++;
            this.valueIndex++;

            return {
              type: 'component',
              fiber,
            };
          }

          // 배열이 들어 왔다면
          if (Array.isArray(value)) {
            const result = values[this.valueIndex++].map((value: any) => {
              if (isRenderResultObject(value)) {
                const vdom = new Parser(value).parse();
                return vdom;
              }
            });
            return result;
          }

          // marker가 있다면 원본 텍스트를 변경한다.
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
