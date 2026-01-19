import { vi, expect, test, beforeEach, afterEach, describe } from 'vitest';
import { watchProps, rootRender, state, html, createComponent } from '../core';
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

describe('컴포넌트 테스트', () => {
  test('텍스트 노드만 들어올 때 테스트 한다.', async () => {
    function Component() {
      return html`123`;
    }
    rootRender(document.getElementById('root')!, Component);
    expect(document.getElementById('root')?.textContent).toBe('123');
  });

  test('동적 텍스트 노드만 들어올 때 테스트 한다.', async () => {
    function Component() {
      const data = 123;
      return html`${data}`;
    }
    rootRender(document.getElementById('root')!, Component);
    expect(document.getElementById('root')?.textContent).toBe('123');
  });

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

      return html` <div id="app">
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

      return html` <div id="app">
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

  test('컴포넌트가 추가되었을 때 테스트 한다.', async () => {
    function Component() {
      const data = state({
        arr: [0],
      });

      const trigger = () => {
        data.arr = [...data.arr, data.arr.length];
      };

      return html` <div id="app">
        <button type="button" @click=${trigger}>trigger</button>
        <ul>
          ${data.arr.map((item) => html`<li>${item + 1}</li>`)}
        </ul>
      </div>`;
    }

    rootRender(document.getElementById('root')!, Component);
    expect(document.querySelector('ul')?.children).toHaveLength(1);

    document.querySelector('button')?.click();
    await flushRaf();
    expect(document.querySelector('ul')?.children).toHaveLength(2);

    document.querySelector('button')?.click();
    await flushRaf();
    expect(document.querySelector('ul')?.children).toHaveLength(3);
  });

  test('컴포넌트가 다수 추가되었을 때 테스트 한다.', async () => {
    function Component() {
      const data = state({
        arr: [0],
      });

      const trigger = () => {
        data.arr = Array.from({ length: data.arr.length * 3 }, (_, i) => i);
      };

      return html` <div id="app">
        <button type="button" @click=${trigger}>trigger</button>
        <ul>
          ${data.arr.map((item) => html`<li>${item + 1}</li>`)}
        </ul>
      </div>`;
    }

    rootRender(document.getElementById('root')!, Component);
    expect(document.querySelector('ul')?.children).toHaveLength(1);

    document.querySelector('button')?.click();
    await flushRaf();
    expect(document.querySelector('ul')?.children).toHaveLength(3);

    document.querySelector('button')?.click();
    await flushRaf();
    expect(document.querySelector('ul')?.children).toHaveLength(9);
  });

  test('컴포넌트가 삭제되었을 때 테스트 한다.', async () => {
    function Component() {
      const data = state({
        arr: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      });

      const trigger = () => {
        data.arr = data.arr.slice(0, data.arr.length - 1);
      };

      return html` <div id="app">
        <button type="button" @click=${trigger}>trigger</button>
        <ul>
          ${data.arr.map((item) => html`<li>${item + 1}</li>`)}
        </ul>
      </div>`;
    }

    rootRender(document.getElementById('root')!, Component);
    expect(document.querySelector('ul')?.children).toHaveLength(10);

    document.querySelector('button')?.click();
    await flushRaf();
    expect(document.querySelector('ul')?.children).toHaveLength(9);

    document.querySelector('button')?.click();
    await flushRaf();
    expect(document.querySelector('ul')?.children).toHaveLength(8);
  });

  test('컴포넌트가 다수 삭제되었을 때 테스트 한다.', async () => {
    function Component() {
      const data = state({
        arr: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      });

      const trigger = () => {
        data.arr = data.arr.slice(0, data.arr.length - 2);
      };

      return html` <div id="app">
        <button type="button" @click=${trigger}>trigger</button>
        <ul>
          ${data.arr.map((item) => html`<li>${item + 1}</li>`)}
        </ul>
      </div>`;
    }

    rootRender(document.getElementById('root')!, Component);
    expect(document.querySelector('ul')?.children).toHaveLength(10);

    document.querySelector('button')?.click();
    await flushRaf();
    expect(document.querySelector('ul')?.children).toHaveLength(8);

    document.querySelector('button')?.click();
    await flushRaf();
    expect(document.querySelector('ul')?.children).toHaveLength(6);
  });

  test('중첩 컴포넌트가 추가되었을 때 테스트 한다.', async () => {
    function ArrayChild({ value }: { value: number }) {
      return html`<li>${value * 2}</li>`;
    }

    function Component() {
      const data = state({
        arr: [0],
      });

      const trigger = () => {
        data.arr = [...data.arr, data.arr.length];
      };

      return html` <div id="app">
        <button type="button" @click=${trigger}>trigger</button>
        <ul>
          ${data.arr.map((item) => createComponent(ArrayChild, { props: { value: item } }))}
        </ul>
      </div>`;
    }

    rootRender(document.getElementById('root')!, Component);
    expect(document.querySelector('ul')?.children).toHaveLength(1);

    document.querySelector('button')?.click();
    await flushRaf();
    expect(document.querySelector('ul')?.children).toHaveLength(2);

    document.querySelector('button')?.click();
    await flushRaf();
    expect(document.querySelector('ul')?.children).toHaveLength(3);
  });

  test('중첩 컴포넌트가 다수 추가되었을 때 테스트 한다.', async () => {
    function ArrayChild({ value }: { value: number }) {
      return html`<li>${value * 2}</li>`;
    }

    function Component() {
      const data = state({
        arr: [0],
      });

      const trigger = () => {
        data.arr = Array.from({ length: data.arr.length * 3 }, (_, i) => i);
      };

      return html` <div id="app">
        <button type="button" @click=${trigger}>trigger</button>
        <ul>
          ${data.arr.map((item) => createComponent(ArrayChild, { props: { value: item } }))}
        </ul>
      </div>`;
    }

    rootRender(document.getElementById('root')!, Component);
    expect(document.querySelector('ul')?.children).toHaveLength(1);

    document.querySelector('button')?.click();
    await flushRaf();
    expect(document.querySelector('ul')?.children).toHaveLength(3);

    document.querySelector('button')?.click();
    await flushRaf();
    expect(document.querySelector('ul')?.children).toHaveLength(9);
  });

  test('중첩 컴포넌트가 삭제되었을 때 테스트 한다.', async () => {
    function ArrayChild({ value }: { value: number }) {
      return html`<li>${value * 2}</li>`;
    }

    function Component() {
      const data = state({
        arr: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      });

      const trigger = () => {
        data.arr = data.arr.slice(0, data.arr.length - 1);
      };

      return html` <div id="app">
        <button type="button" @click=${trigger}>trigger</button>
        <ul>
          ${data.arr.map((item) => createComponent(ArrayChild, { props: { value: item } }))}
        </ul>
      </div>`;
    }

    rootRender(document.getElementById('root')!, Component);
    expect(document.querySelector('ul')?.children).toHaveLength(10);

    document.querySelector('button')?.click();
    await flushRaf();
    expect(document.querySelector('ul')?.children).toHaveLength(9);

    document.querySelector('button')?.click();
    await flushRaf();
    expect(document.querySelector('ul')?.children).toHaveLength(8);
  });

  test('중첩 컴포넌트가 다수 삭제되었을 때 테스트 한다.', async () => {
    function ArrayChild({ value }: { value: number }) {
      return html`<li>${value * 2}</li>`;
    }

    function Component() {
      const data = state({
        arr: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      });

      const trigger = () => {
        data.arr = data.arr.slice(0, data.arr.length - 2);
      };

      return html` <div id="app">
        <button type="button" @click=${trigger}>trigger</button>
        <ul>
          ${data.arr.map((item) => createComponent(ArrayChild, { props: { value: item } }))}
        </ul>
      </div>`;
    }

    rootRender(document.getElementById('root')!, Component);
    expect(document.querySelector('ul')?.children).toHaveLength(10);

    document.querySelector('button')?.click();
    await flushRaf();
    expect(document.querySelector('ul')?.children).toHaveLength(8);

    document.querySelector('button')?.click();
    await flushRaf();
    expect(document.querySelector('ul')?.children).toHaveLength(6);
  });

  test('중첩 컴포넌트의 리렌더링을 테스트 한다.', async () => {
    let prev1 = -1;
    let prev2 = -1;

    function App() {
      const data = state({
        count: 0,
      });

      const onClick = () => {
        data.count += 1;
      };

      return html` <div id="app">
        <button type="button" @click=${onClick}>트리거</button>
        <div id="val1">${data.count}</div>
        ${createComponent(Son, {
          props: {
            value: data.count * 2,
          },
        })}
      </div>`;
    }

    interface CommonProps {
      value: number;
    }

    const watchPropsFn1 = vi.fn((prev: CommonProps) => {
      prev1 = prev.value;
    });
    const watchPropsFn2 = vi.fn((prev: CommonProps) => {
      prev2 = prev.value;
    });

    function Son({ value }: CommonProps) {
      watchProps<CommonProps>(watchPropsFn1);

      return html` <div>
        <div id="val2">${value}</div>
        ${createComponent(GrandSon, {
          props: {
            value: value * 2,
          },
        })}
      </div>`;
    }

    function GrandSon({ value }: CommonProps) {
      watchProps<CommonProps>(watchPropsFn2);

      return html`<div id="val3">${value}</div>`;
    }

    rootRender(document.getElementById('root')!, App);

    document.querySelector('button')?.click();
    await flushRaf();
    expect(prev1).toBe(0);
    expect(prev2).toBe(0);
    expect(document.getElementById('val1')?.textContent).toBe('1');
    expect(document.getElementById('val2')?.textContent).toBe('2');
    expect(document.getElementById('val3')?.textContent).toBe('4');

    document.querySelector('button')?.click();
    await flushRaf();
    expect(prev1).toBe(2);
    expect(prev2).toBe(4);
    expect(document.getElementById('val1')?.textContent).toBe('2');
    expect(document.getElementById('val2')?.textContent).toBe('4');
    expect(document.getElementById('val3')?.textContent).toBe('8');

    document.querySelector('button')?.click();
    await flushRaf();
    expect(prev1).toBe(4);
    expect(prev2).toBe(8);
    expect(document.getElementById('val1')?.textContent).toBe('3');
    expect(document.getElementById('val2')?.textContent).toBe('6');
    expect(document.getElementById('val3')?.textContent).toBe('12');
  });
});
