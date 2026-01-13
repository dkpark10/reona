import { beforeEach, afterEach, expect, test, describe } from 'vitest';
import { mounted, state, html, rootRender, ref, setRef } from '../core';
import { flushRaf } from './utils';

beforeEach(() => {
  const div = document.createElement('div');
  div.id = 'root';
  document.body.appendChild(div);
});

afterEach(() => {
  if (document.getElementById('root')) {
    document.body.removeChild(document.getElementById('root')!);
  }
});

describe('refs 테스트', () => {
  test('refs 값 변경 시 리렌더링이 되어서는 안된다.', async () => {
    function Ref() {
      const data = state({
        value: 0,
      });

      const unStateless = ref({
        value: 9999,
      });

      const trigger = () => {
        data.value += 1;
      };

      const noop = () => {
        unStateless.current.value += 1;
      };

      return html`
        <div id="app">
          <button type="button" data-testid="trigger" @click=${trigger}>trigger</button>
          <button type="button" data-testid="noop" @click=${noop}>noop</button>
          <div id="value">${unStateless.current.value}</div>
        </div>
      `;
    }

    rootRender(document.getElementById('root')!, Ref);

    (document.querySelector('button[data-testid="noop"]') as HTMLButtonElement)?.click();
    await flushRaf();
    expect(document.getElementById('value')?.textContent).toBe('9999');

    (document.querySelector('button[data-testid="trigger"]') as HTMLButtonElement)?.click();
    await flushRaf();
    expect(document.getElementById('value')?.textContent).toBe('10000');
  });

  test('ref에 엘리먼트를 할당할 수 있어야 한다.', async () => {
    let result: unknown;
    function RefElement() {
      const headingElement = ref<{ element: HTMLHeadElement | null }>({
        element: null,
      });

      mounted(() => {
        result = headingElement.current.element;
      });

      return html`
        <div id="app">
          <h1 $$ref="${setRef(headingElement, 'element')}">hh</h1>
        </div>
      `;
    }

    rootRender(document.getElementById('root')!, RefElement);
    await flushRaf();
    expect((result as HTMLHeadingElement).tagName).toBe('H1');
    expect((result as HTMLHeadingElement).textContent).toBe('hh');
  });
});
