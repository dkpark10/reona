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
      const text = node.textContent ?? '';

      // 공백제거
      if (/^\s*$/.test(text)) return null;

      // 마커 기준으로 쪼개서 고정 문자열과 값을 순서대로 반환
      // 원시값은 앞뒤 문자열과 하나의 텍스트로 합치고, 노드가 오면 끊는다.
      if (/__marker_\d+__/.test(text)) {
        const result: Array<VNode | Array<VNode | undefined>> = [];
        let buffer = '';

        const flush = () => {
          if (!/^\s*$/.test(buffer)) {
            result.push({ type: 'text', value: buffer });
          }
          buffer = '';
        };

        for (const part of text.split(/(__marker_\d+__)/)) {
          if (!/^__marker_\d+__$/.test(part)) {
            buffer += part;
            continue;
          }

          const vnode = convertValue(renderResult.values[valueIndex++]);
          if (!Array.isArray(vnode) && vnode.type === 'text') {
            buffer += vnode.value;
            continue;
          }

          flush();
          result.push(vnode);
        }
        flush();

        return result as Array<VNode | null>;
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

  function convertValue(value: any): VNode | Array<VNode | undefined> {
    // createComponent 반환 함수일 시
    if (isCreateComponentFunc(value)) {
      const instance = value(currentSequence!);
      currentSequence!++;
      return { type: 'component', instance, key: instance.key };
    }

    if (isRenderResultObject(value)) {
      return parse(value);
    }

    // 배열이 들어 왔다면
    if (Array.isArray(value)) {
      return value.map((item: any) => {
        if (isRenderResultObject(item)) {
          const vdom = parse(item);
          if (vdom.type === 'element' && vdom.attr?.key === undefined) {
            throw new Error('배열 엘리먼트의 key가 누락되었습니다.');
          }
          return vdom;
        }
        if (isCreateComponentFunc(item)) {
          const instance = item(currentSequence!);
          currentSequence!++;
          if (instance.key === null || instance.key === undefined) {
            throw new Error('배열컴포넌트의 key가 누락되었습니다.');
          }
          return { type: 'component', instance, key: instance.key };
        }
      });
    }

    return { type: 'text', value: value !== undefined ? String(value) : '' };
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
