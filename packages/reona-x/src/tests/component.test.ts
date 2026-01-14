import { expect, test, beforeEach, afterEach, describe, vi } from 'vitest';
import { rootRender, state, html, memo } from '../core';
import { flushRaf } from './utils';

beforeEach(() => {
  const div = document.createElement('div');
  div.id = 'root';
  document.body.appendChild(div);
});

afterEach(() => {
  document.body.removeChild(document.getElementById('root')!);
});

describe('컴포넌트 테스트', () => {
  test('복수의 상태 훅을 테스트 한다.', async () => {
    function Component() {
      const data1 = state({
        count: 0,
      });

      const data2 = state({
        count: 0,
      });

      const data3 = state({
        count: 0,
      });

      const trigger1 = () => {
        data1.count += 1;
      };

      const trigger2 = () => {
        data2.count += 1;
      };

      const trigger3 = () => {
        data3.count += 1;
      };

      return html`
        <div id="app">
          <button type="button" data-testid="btn1" @click=${trigger1}>trigger1</button>
          <button type="button" data-testid="btn2" @click=${trigger2}>trigger2</button>
          <button type="button" data-testid="btn3" @click=${trigger3}>trigger3</button>
          <div data-testid="data1">${data1.count}</div>
          <div data-testid="data2">${data2.count}</div>
          <div data-testid="data3">${data3.count}</div>
        </div>`;
    }

    rootRender(document.getElementById('root')!, Component);

    (document.querySelector('button[data-testid="btn1"]') as HTMLButtonElement).click();
    (document.querySelector('button[data-testid="btn2"]') as HTMLButtonElement).click();
    (document.querySelector('button[data-testid="btn3"]') as HTMLButtonElement).click();
    await flushRaf();

    expect(document.querySelector('div[data-testid="data1"]')?.textContent).toBe('1');
    expect(document.querySelector('div[data-testid="data2"]')?.textContent).toBe('1');
    expect(document.querySelector('div[data-testid="data3"]')?.textContent).toBe('1');

    (document.querySelector('button[data-testid="btn1"]') as HTMLButtonElement).click();
    (document.querySelector('button[data-testid="btn2"]') as HTMLButtonElement).click();
    (document.querySelector('button[data-testid="btn3"]') as HTMLButtonElement).click();
    await flushRaf();

    expect(document.querySelector('div[data-testid="data1"]')?.textContent).toBe('2');
    expect(document.querySelector('div[data-testid="data2"]')?.textContent).toBe('2');
    expect(document.querySelector('div[data-testid="data3"]')?.textContent).toBe('2');
  });

  test('복수의 상태 훅을 테스트 한다2.', async () => {
    function Component() {
      const data1 = state({
        count: 0,
      });

      const data2 = state({
        count: 0,
      });

      const data3 = state({
        count: 0,
      });

      const allTrigger = () => {
        data1.count += 1;
        data2.count += 1;
        data3.count += 1;
      };

      return html`
        <div id="app">
          <button type="button" @click=${allTrigger}>trigger4</button>
          <div data-testid="data1">${data1.count}</div>
          <div data-testid="data2">${data2.count}</div>
          <div data-testid="data3">${data3.count}</div>
        </div>`;
    }

    rootRender(document.getElementById('root')!, Component);

    document.querySelector('button')?.click();
    await flushRaf();

    expect(document.querySelector('div[data-testid="data1"]')?.textContent).toBe('1');
    expect(document.querySelector('div[data-testid="data2"]')?.textContent).toBe('1');
    expect(document.querySelector('div[data-testid="data3"]')?.textContent).toBe('1');

    document.querySelector('button')?.click();
    await flushRaf();

    expect(document.querySelector('div[data-testid="data1"]')?.textContent).toBe('2');
    expect(document.querySelector('div[data-testid="data2"]')?.textContent).toBe('2');
    expect(document.querySelector('div[data-testid="data3"]')?.textContent).toBe('2');
  });

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
});
