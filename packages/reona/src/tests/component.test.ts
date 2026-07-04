import { vi, expect, test, beforeEach, afterEach, describe } from 'vitest';
import {
  mounted,
  ref,
  watchProps,
  rootRender,
  state,
  html,
  createComponent,
  createContext,
  context,
} from '../core';
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

  test('부모 렌더링 시 자식 리렌더링을 테스트 한다.', async () => {
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
    expect(watchPropsFn1).toHaveBeenCalledOnce();
    expect(watchPropsFn2).toHaveBeenCalledOnce();
    expect(document.getElementById('val1')?.textContent).toBe('1');
    expect(document.getElementById('val2')?.textContent).toBe('2');
    expect(document.getElementById('val3')?.textContent).toBe('4');

    document.querySelector('button')?.click();
    await flushRaf();
    expect(prev1).toBe(2);
    expect(prev2).toBe(4);
    expect(watchPropsFn1).toHaveBeenCalledTimes(2);
    expect(watchPropsFn2).toHaveBeenCalledTimes(2);
    expect(document.getElementById('val1')?.textContent).toBe('2');
    expect(document.getElementById('val2')?.textContent).toBe('4');
    expect(document.getElementById('val3')?.textContent).toBe('8');

    document.querySelector('button')?.click();
    await flushRaf();
    expect(prev1).toBe(4);
    expect(prev2).toBe(8);
    expect(watchPropsFn1).toHaveBeenCalledTimes(3);
    expect(watchPropsFn2).toHaveBeenCalledTimes(3);
    expect(document.getElementById('val1')?.textContent).toBe('3');
    expect(document.getElementById('val2')?.textContent).toBe('6');
    expect(document.getElementById('val3')?.textContent).toBe('12');
  });

  test('리렌더링 시 watchProps 호출 횟수를 테스트 한다.', async () => {
    vi.useFakeTimers();
    let executionCount = 0;
    interface TimerProps {
      beginCountTrigger: boolean;
    }

    function App() {
      const data = state({
        trigger: false,
      });

      const onClick = () => {
        data.trigger = !data.trigger;
      };

      return html` <div id="app">
        <button type="button" @click=${onClick}>trigger</button>
        ${createComponent(Timer, {
          props: {
            beginCountTrigger: data.trigger,
          },
        })}
      </div>`;
    }

    function Timer({ beginCountTrigger }: TimerProps) {
      const data = state({
        count: 0,
      });

      const timer = ref<{ id: number | null }>({
        id: null,
      });

      watchProps<TimerProps>(() => {
        executionCount += 1;
        if (beginCountTrigger) {
          timer.current.id = setInterval(() => {
            data.count += 1;
          }, 1_000);
        }

        if (!beginCountTrigger && timer.current.id) {
          clearInterval(timer.current.id);
          data.count = 0;
          return;
        }
      });

      mounted(() => {
        return () => {
          if (timer.current.id) {
            clearInterval(timer.current.id);
          }
        };
      });

      return html`<time>${data.count}</time>`;
    }

    rootRender(document.getElementById('root')!, App);
    document.querySelector('button')?.click();
    vi.advanceTimersByTime(100);
    expect(executionCount).toBe(1);

    vi.advanceTimersByTime(1000);
    expect(document.querySelector('time')?.textContent).toBe('1');
    expect(executionCount).toBe(1);

    vi.advanceTimersByTime(1000);
    expect(document.querySelector('time')?.textContent).toBe('2');
    expect(executionCount).toBe(1);

    vi.advanceTimersByTime(1000);
    expect(document.querySelector('time')?.textContent).toBe('3');
    expect(executionCount).toBe(1);
  });

  test('서로 다른 부모의 자식끼리 인스턴스를 공유하지 않는다.', async () => {
    function Leaf({ id }: { id: string }) {
      const data = state({ count: 0 });

      const onClick = () => {
        data.count += 1;
      };

      return html`
        <button type="button" data-testid=${id} @click=${onClick}>${data.count}</button>
      `;
    }

    function A() {
      return html`<div>
        ${createComponent(Leaf, { props: { id: 'a1' } })}
        ${createComponent(Leaf, { props: { id: 'a2' } })}
      </div>`;
    }

    function B() {
      return html`<div>${createComponent(Leaf, { props: { id: 'b1' } })}</div>`;
    }

    function App() {
      return html`<div>${createComponent(A)}${createComponent(B)}</div>`;
    }

    rootRender(document.getElementById('root')!, App);

    (document.querySelector('[data-testid="a2"]') as HTMLButtonElement).click();
    await flushRaf();

    expect(document.querySelector('[data-testid="a1"]')?.textContent).toBe('0');
    expect(document.querySelector('[data-testid="a2"]')?.textContent).toBe('1');
    expect(document.querySelector('[data-testid="b1"]')?.textContent).toBe('0');
  });

  test.skip('중첩 html 안의 컴포넌트끼리 인스턴스를 공유하지 않는다.', async () => {
    function C({ tag }: { tag: string }) {
      return html`<span>${tag}</span>`;
    }

    function App() {
      return html`<div>
        ${html`<p>${createComponent(C, { props: { tag: 'A' } })}</p>`}
        ${html`<p>${createComponent(C, { props: { tag: 'B' } })}</p>`}
      </div>`;
    }

    rootRender(document.getElementById('root')!, App);

    const spans = document.querySelectorAll('span');
    expect(spans[0]?.textContent).toBe('A');
    expect(spans[1]?.textContent).toBe('B');
  });

  test.skip('리렌더링 시 이벤트 핸들러가 새 props를 참조한다.', async () => {
    const log = vi.fn();

    function Child({ v }: { v: number }) {
      const onClick = () => log(v);
      return html`<button type="button" id="child" @click=${onClick}>${v}</button>`;
    }

    function App() {
      const data = state({ v: 1 });
      const onClick = () => {
        data.v += 1;
      };

      return html`<div>
        <button type="button" id="parent" @click=${onClick}>up</button>
        ${createComponent(Child, { props: { v: data.v } })}
      </div>`;
    }

    rootRender(document.getElementById('root')!, App);

    (document.getElementById('parent') as HTMLButtonElement).click();
    await flushRaf();
    expect(document.getElementById('child')?.textContent).toBe('2');

    (document.getElementById('child') as HTMLButtonElement).click();
    expect(log).toHaveBeenLastCalledWith(2);
  });

  test.skip('중첩된 Provider는 각자의 값을 제공한다.', async () => {
    const Ctx = createContext('default');

    function OuterReader() {
      const value = context(Ctx);
      return html`<span id="outer">${value}</span>`;
    }

    function InnerReader() {
      const value = context(Ctx);
      return html`<span id="inner">${value}</span>`;
    }

    function Inner() {
      return Ctx.provider({
        value: 'inner',
        children: html`${createComponent(InnerReader)}`,
      });
    }

    function App() {
      return Ctx.provider({
        value: 'outer',
        children: html`<div>${createComponent(Inner)}${createComponent(OuterReader)}</div>`,
      });
    }

    rootRender(document.getElementById('root')!, App);

    expect(document.getElementById('inner')?.textContent).toBe('inner');
    expect(document.getElementById('outer')?.textContent).toBe('outer');
  });

  test.skip('리렌더링 시 삭제된 속성이 DOM에서 지워진다.', async () => {
    function App() {
      const data = state({ on: true });
      const onClick = () => {
        data.on = !data.on;
      };

      return html`<div>
        <button type="button" @click=${onClick}>toggle</button>
        ${data.on ? html`<p class="x" title="t">p</p>` : html`<p>p</p>`}
      </div>`;
    }

    rootRender(document.getElementById('root')!, App);
    expect(document.querySelector('p')?.getAttribute('class')).toBe('x');

    document.querySelector('button')?.click();
    await flushRaf();

    expect(document.querySelector('p')?.hasAttribute('class')).toBe(false);
    expect(document.querySelector('p')?.hasAttribute('title')).toBe(false);
  });

  test.skip('고정 문자열과 컴포넌트가 같은 텍스트에 있어도 고정 문자열이 유지된다.', async () => {
    function C() {
      return html`<b>C</b>`;
    }

    function App() {
      return html`<div id="wrap">hello ${createComponent(C)} world</div>`;
    }

    rootRender(document.getElementById('root')!, App);

    const wrap = document.getElementById('wrap');
    expect(wrap?.querySelector('b')?.textContent).toBe('C');
    expect(wrap?.textContent).toBe('hello C world');
  });
});
