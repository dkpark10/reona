import type { RenderResult, Props } from '../utils/types';
import { isRenderResultObject, isEmpty } from '../utils';
import ComponentInstance from './component-instance';

export type VTextNode = {
  type: 'text';
  value: string;
};

export type VElementNode = {
  type: 'element';
  tag: keyof HTMLElementTagNameMap;
  attr?: Props;
  children: VNode[];
};

export type VComponent = {
  type: 'component';
  instance: ComponentInstance;
  key?: string | number;
};

export type VNode = VTextNode | VElementNode | VComponent;

function isCreateComponentFunc(func: any): func is (sequence: number) => ComponentInstance {
  return typeof func === 'function' && func.__isCreateComponent;
}

/** @description 받은 html을 vnode tree로 만듬 */
export default function parse(renderResult: RenderResult, sequence?: number) {
  let valueIndex = 0;
  let currentSequence = sequence;

  function convertNode(el?: Element): VElementNode | VTextNode {
    if (!el) {
      return {
        type: 'text',
        value: '',
      };
    }

    const attrs: Props = {};
    for (const attr of el.attributes) {
      const { values } = renderResult;

      const nameMarker = attr.name.match(/^__marker_(\d+)__$/);
      if (nameMarker) {
        const value = values[valueIndex++];
        if (value && typeof value === 'string') {
          attrs[value] = true;
        }
        continue;
      }

      const markers = attr.value.match(/__marker_(\d+)__/g);
      if (markers && markers.length >= 1) {
        if (typeof values[valueIndex] === 'function') {
          attrs[attr.name] = values[valueIndex++];
        } else if (typeof values[valueIndex] === 'object') {
          attrs[attr.name] = values[valueIndex++];
          console.warn(
            `${el.tagName.toLowerCase()} 엘리먼트에 ${attr.name} 속성에 ${values[valueIndex - 1]} 객체가 들어가 있습니다. 값이 맞는지 확인하세요.`
          );
        } else {
          attrs[attr.name] = attr.value.replace(/__marker_(\d+)__/g, () => {
            const v = values[valueIndex++];
            return v !== undefined ? String(v) : '';
          });
        }
      } else {
        attrs[attr.name] = attr.value;
      }
    }

    const children: VNode[] = [];
    for (const child of el.childNodes) {
      const vnode = convertChild(child);
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

  function convertChild(node: ChildNode): VNode | Array<VNode | null> | null {
    if (node.nodeType === Node.TEXT_NODE) {
      let text = node.textContent ?? '';

      // 공백제거
      if (/^\s*$/.test(text)) return null;

      // marker가 붙어있는 경우가 있으므로 match
      const markers = text.match(/__marker_(\d+)__/g);
      if (markers && markers.length >= 1) {
        return markers.map(() => {
          const { values } = renderResult;
          const value = values[valueIndex];

          // createComponent 반환 함수일 시
          if (isCreateComponentFunc(value)) {
            const getInstance = value as (sequence: number) => any;
            const instance = getInstance(currentSequence!) as ComponentInstance;

            currentSequence!++;
            valueIndex++;

            return {
              type: 'component',
              instance,
              key: instance.key,
            };
          }

          if (isRenderResultObject(value)) {
            const vdom = parse(value);
            return vdom;
          }

          // 배열이 들어 왔다면
          if (Array.isArray(value)) {
            const result = values[valueIndex++].map((value: any) => {
              if (isRenderResultObject(value)) {
                const vdom = parse(value);

                if (vdom.type === 'element' && vdom.attr?.key === undefined) {
                  throw new Error('배열 엘리먼트의 key가 누락되었습니다.');
                }

                return vdom;
              }
              if (isCreateComponentFunc(value)) {
                const getInstance = value;
                const instance = getInstance(currentSequence!) as ComponentInstance;
                currentSequence!++;

                if (instance.key === null || instance.key === undefined) {
                  throw new Error('배열컴포넌트의 key가 누락되었습니다.');
                }

                return {
                  type: 'component',
                  instance,
                  key: instance.key,
                };
              }
            });
            return result;
          }

          // marker가 있다면 원본 텍스트를 변경한다.
          if (/__marker_(\d+)__/.test(text)) {
            text = replaceMarkers(text);
            return {
              type: 'text',
              value: text,
            };
          }
          // marker 가 없으면 빈 텍스트 반환
          return null;
        });
      }

      return {
        type: 'text',
        value: text,
      };
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      return convertNode(node as Element);
    }

    return null;
  }

  function replaceMarkers(str: string): string {
    const { values } = renderResult;
    return str.replace(/__marker_(\d+)__/g, () => {
      const v = values[valueIndex++];
      return v !== undefined ? String(v) : '';
    });
  }

  // 메인 파싱 로직
  const { template: t } = renderResult;
  const template = document.createElement('template');

  template.innerHTML = t.trim();

  if (template.content.childNodes.length > 1) {
    throw new Error('루트 엘리먼트는 1개여야 합니다.');
  }

  const firstChild = template.content.firstChild;

  // 텍스트 노드, 단일 컴포넌트 처리
  if (firstChild && firstChild.nodeType === Node.TEXT_NODE) {
    const vDom = convertChild(firstChild);
    if (Array.isArray(vDom)) {
      return vDom.filter((v) => !!v)[0];
    }
    return vDom!;
  }

  return convertNode(template.content.firstElementChild!);
}
