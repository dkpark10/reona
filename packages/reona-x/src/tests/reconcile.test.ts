import { expect, test, beforeEach, afterEach, describe } from 'vitest';
import { rootRender, state, html, createComponent } from '../core';
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

describe('재조정 로직으로 인한 컴포넌트 테스트', () => {
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
          ${data.arr.map((item) => html`<li key=${item}>${item + 1}</li>`)}
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
          ${data.arr.map((item) => html`<li key=${item}>${item + 1}</li>`)}
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
          ${data.arr.map((item) => html`<li key=${item}>${item + 1}</li>`)}
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
          ${data.arr.map((item) => html`<li key=${item}>${item + 1}</li>`)}
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
          ${data.arr.map((item) =>
            createComponent(ArrayChild, { props: { value: item }, key: item })
          )}
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
          ${data.arr.map((item) =>
            createComponent(ArrayChild, { props: { value: item }, key: item })
          )}
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
          ${data.arr.map((item) =>
            createComponent(ArrayChild, { props: { value: item }, key: item })
          )}
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
          ${data.arr.map((item) =>
            createComponent(ArrayChild, { props: { value: item }, key: item })
          )}
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
});
