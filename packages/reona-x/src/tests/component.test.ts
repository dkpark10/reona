import { expect, test, beforeEach, afterEach, describe } from 'vitest';
import { rootRender, state, html } from '../core';
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
})
