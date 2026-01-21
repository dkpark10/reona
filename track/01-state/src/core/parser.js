import ComponentInstance from './component-instance';

/**
 * @typedef {Object} RenderResult
 * @property {string} template
 * @property {any[]} values
 */

/**
 * @param {RenderResult} obj
 * @returns {boolean}
 */
function isRenderResultObject(obj) {
  return (
    obj !== null &&
    typeof obj === 'object' &&
    typeof obj.template === 'string' &&
    Array.isArray(obj.values)
  );
}

/**
 * @param {Object} obj
 * @returns {boolean}
 */
export function isEmpty(obj) {
  return Object.keys(obj).length <= 0;
}

/**
 * @typedef {Object} VTextNode
 * @property {"text"} type
 * @property {string} value
 * @export
 */

/**
 * @typedef {Object} VElementNode
 * @property {"element"} type
 * @property {keyof HTMLElementTagNameMap} tag
 * @property {Props=} attr
 * @property {VNode[]} children
 * @export
 */

/**
 * @typedef {Object} VComponent
 * @property {"component"} type
 * @property {ComponentInstance} instance
 * @export
 */

/**
 * @typedef {VTextNode | VElementNode | VComponent} VNode
 * @export
 */

/**
 * @description 받은 html을 vnode tree로 만듬
 * @param {RenderResult} renderResult
 * @param {number=} sequence
 * @returns {VNode}
 */
export default function parse(renderResult, sequence) {
  let valueIndex = 0;
  let currentSequence = sequence;

  /**
   * @param {HTMLElement} el
   */
  function convertNode(el) {
    if (!el) {
      return {
        type: 'text',
        value: '',
      };
    }

    const attrs = {};

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

    const children = [];
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
      tag: el.tagName.toLowerCase(),
      children,
      ...(!isEmpty(attrs) && { attr: attrs }),
    };
  }

  /**
   * @param {ChildNode} node
   */
  function convertChild(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      let text = node.textContent ?? '';

      // 공백을 제거
      if (/^\s*$/.test(text)) return null;

      // marker가 붙어있는 경우가 있으므로 match
      const markers = text.match(/__marker_(\d+)__/g);
      if (markers && markers.length >= 1) {
        return markers.map(() => {
          const { values } = renderResult;
          const value = values[valueIndex];

          if (isRenderResultObject(value)) {
            const vdom = parse(value);
            return vdom;
          }

          // 배열이 들어 왔다면
          if (Array.isArray(value)) {
            const result = values[valueIndex++].map((value) => {
              if (isRenderResultObject(value)) {
                const vdom = parse(value);
                return vdom;
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
      return convertNode(node);
    }

    return null;
  }

  /**
   * @param {string} str
   * @return {string}
   */
  function replaceMarkers(str) {
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

  /**
   * 텍스트 노드, 단일 컴포넌트 처리
   * html`text`, html`<component />`
   */
  if (firstChild && firstChild.nodeType === Node.TEXT_NODE) {
    const vDom = convertChild(firstChild);
    if (Array.isArray(vDom)) {
      return vDom.filter((v) => !!v)[0];
    }
    return vDom;
  }

  return convertNode(template.content.firstElementChild);
}
