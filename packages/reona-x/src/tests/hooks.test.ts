import { expect, test, beforeEach, afterEach, describe, vi } from 'vitest';
import { createStore, store, createComponent, ref, mounted, rootRender, setRef, state, html, memo } from '../core';
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

describe('memo 테스트', () => {
  test('객체 의존성이 변경되면 재계산한다.', async () => {
    const computeFn = vi.fn((count: number) => count * 2);

    function Component() {
      const data = state({ count: 1 });

      const doubled = memo(data, () => computeFn(data.count));

      const increment = () => {
        data.count += 1;
      };

      return html`
        <div id="app">
          <button type="button" @click=${increment}>increment</button>
          <div data-testid="result">${doubled}</div>
        </div>`;
    }

    rootRender(document.getElementById('root')!, Component);

    expect(document.querySelector('div[data-testid="result"]')?.textContent).toBe('2');
    expect(computeFn).toHaveBeenCalledTimes(1);

    document.querySelector('button')?.click();
    await flushRaf();

    expect(document.querySelector('div[data-testid="result"]')?.textContent).toBe('4');
    expect(computeFn).toHaveBeenCalledTimes(2);
  });

  test('객체 의존성이 변경되지 않으면 캐시된 값을 반환한다.', async () => {
    const computeFn = vi.fn((count: number) => count * 2);

    function Component() {
      const data = state({ count: 1 });

      const doubled = memo(data, () => computeFn(data.count));

      const noop = () => {
        data.count = data.count;
      };

      return html`
        <div id="app">
          <button type="button" @click=${noop}>noop</button>
          <div data-testid="result">${doubled}</div>
        </div>`;
    }

    rootRender(document.getElementById('root')!, Component);

    document.querySelector('button')?.click();
    await flushRaf();

    expect(document.querySelector('div[data-testid="result"]')?.textContent).toBe('2');
    expect(computeFn).toHaveBeenCalledTimes(1);

    document.querySelector('button')?.click();
    await flushRaf();

    expect(document.querySelector('div[data-testid="result"]')?.textContent).toBe('2');
    expect(computeFn).toHaveBeenCalledTimes(1);
  });

  test('원시값 의존성이 변경되면 재계산한다.', async () => {
    const computeFn = vi.fn((count: number) => count * 3);

    function Component() {
      const data = state({ count: 1 });

      const tripled = memo(data.count, () => computeFn(data.count));

      const increment = () => {
        data.count += 1;
      };

      return html`
        <div id="app">
          <button type="button" @click=${increment}>increment</button>
          <div data-testid="result">${tripled}</div>
        </div>`;
    }

    rootRender(document.getElementById('root')!, Component);

    expect(document.querySelector('div[data-testid="result"]')?.textContent).toBe('3');
    expect(computeFn).toHaveBeenCalledTimes(1);

    document.querySelector('button')?.click();
    await flushRaf();

    expect(document.querySelector('div[data-testid="result"]')?.textContent).toBe('6');
    expect(computeFn).toHaveBeenCalledTimes(2);
  });

  test('복수의 memo 훅을 사용할 수 있다.', async () => {
    const computeFn1 = vi.fn((count: number) => count * 2);
    const computeFn2 = vi.fn((count: number) => count * 3);

    function Component() {
      const data = state({ count: 1 });

      const doubled = memo(data, () => computeFn1(data.count));
      const tripled = memo(data, () => computeFn2(data.count));

      const increment = () => {
        data.count += 1;
      };

      return html`
        <div id="app">
          <button type="button" @click=${increment}>increment</button>
          <div data-testid="doubled">${doubled}</div>
          <div data-testid="tripled">${tripled}</div>
        </div>`;
    }

    rootRender(document.getElementById('root')!, Component);

    expect(document.querySelector('div[data-testid="doubled"]')?.textContent).toBe('2');
    expect(document.querySelector('div[data-testid="tripled"]')?.textContent).toBe('3');
    expect(computeFn1).toHaveBeenCalledTimes(1);
    expect(computeFn2).toHaveBeenCalledTimes(1);

    document.querySelector('button')?.click();
    await flushRaf();

    expect(document.querySelector('div[data-testid="doubled"]')?.textContent).toBe('4');
    expect(document.querySelector('div[data-testid="tripled"]')?.textContent).toBe('6');
    expect(computeFn1).toHaveBeenCalledTimes(2);
    expect(computeFn2).toHaveBeenCalledTimes(2);
  });
})

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
      const headingElement = ref<HTMLHeadElement | null>(null);

      mounted(() => {
        result = headingElement.current;
      });

      return html`
        <div id="app">
          <h1 $$ref="${setRef(headingElement)}">hh</h1>
        </div>
      `;
    }

    rootRender(document.getElementById('root')!, RefElement);
    await flushRaf();
    expect((result as HTMLHeadingElement).tagName).toBe('H1');
    expect((result as HTMLHeadingElement).textContent).toBe('hh');
  });
});

describe('store 테스트', () => {
  test('전역 스토어 값 업데이트 시 형제 컴포넌트 값도 변경되어야 한다.', async () => {
    function Store() {
      return html`
        <div id="app">
          ${createComponent(Child1)}
          ${createComponent(Child2)}
        </div>
      `;
    }

    const countStore = createStore({
      count: 10000,
    });

    function Child1() {
      const storeData = store(countStore);

      const trigger = () => {
        storeData.count += 1;
      }

      return html`
        <div>
          <button type="button" @click=${trigger}>trigger</button>
          <div id="store1">${storeData.count}</div>
        </div>
      `;
    }

    function Child2() {
      const storeData = store(countStore);

      return html`
        <div id="store2">${storeData.count}</div>
      `;
    }

    rootRender(document.getElementById('root')!, Store);

    (document.querySelector('button') as HTMLButtonElement)?.click();
    await flushRaf();
    expect(document.getElementById('store1')?.textContent).toBe('10001');
    expect(document.getElementById('store2')?.textContent).toBe('10001');

    (document.querySelector('button') as HTMLButtonElement)?.click();
    await flushRaf();
    expect(document.getElementById('store1')?.textContent).toBe('10002');
    expect(document.getElementById('store2')?.textContent).toBe('10002');

    (document.querySelector('button') as HTMLButtonElement)?.click();
    await flushRaf();
    expect(document.getElementById('store1')?.textContent).toBe('10003');
    expect(document.getElementById('store2')?.textContent).toBe('10003');
  });
});
