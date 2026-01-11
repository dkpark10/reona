import { beforeEach, afterEach, vi, expect, test, describe } from 'vitest';
import { html, component, createComponent } from '../core/component';
import { rootRender } from '../core/runtime-dom';
import { flushMicrotasks, flushRaf } from './utils';

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

describe('라이프 사이클 훅 테스트', () => {
  test('상태 변경이 되어도 마운트 훅 실행은 1번이 보장 되어야 한다.', async () => {
    const mockFn = vi.fn(() => {
      console.log('mounted', document.getElementById('app'));
    });

    const C = component({
      mounted: mockFn,

      data() {
        return {
          count: 0,
        };
      },

      methods: {
        trigger() {
          this.count += 1;
        },
      },

      template() {
        return html`
          <div id="app">
            <div data-testid="count">${this.count}</div>
            <button type="button" @click=${this.trigger}>btn</button>
          </div>
        `;
      },
    });

    rootRender(document.getElementById('root')!, C);
    await flushMicrotasks();
    expect(document.getElementById('app')).toBeInTheDocument();
    expect(mockFn).toHaveBeenCalled();

    document.querySelector('button')?.click();
    await flushRaf();
    expect(document.querySelector('[data-testid="count"]')?.textContent).toBe('1');
    expect(mockFn).toHaveBeenCalled();
  });

  test('상태 변경 시 업데이트 훅이 매번 실행되어야 한다.', async () => {
    const mockFn = vi.fn(() => {
      console.log('updated');
    });

    const C = component({
      data() {
        return {
          count: 0,
        };
      },

      updated: mockFn,

      methods: {
        trigger() {
          this.count += 1;
        },
      },

      template() {
        return html`
        <div id="app">
          <div data-testid="count">${this.count}</div>
          <button type="button" @click=${this.trigger}>btn</button>
        </div>
        `;
      },
    });

    rootRender(document.getElementById('root')!, C);

    document.querySelector('button')?.click();
    await flushRaf();
    expect(document.querySelector("[data-testid='count']")?.textContent).toBe('1');
    expect(mockFn).toHaveBeenCalledTimes(1);

    document.querySelector('button')?.click();
    await flushRaf();
    expect(document.querySelector("[data-testid='count']")?.textContent).toBe('2');
    expect(mockFn).toHaveBeenCalledTimes(2);

    document.querySelector('button')?.click();
    await flushRaf();
    expect(document.querySelector("[data-testid='count']")?.textContent).toBe('3');
    expect(mockFn).toHaveBeenCalledTimes(3);
  });

  test("unmount 훅 테스트를 한다.", async () => {
    const div = document.createElement('div');
    div.id = 'root';
    document.body.appendChild(div);

    const mountFn1 = vi.fn(() => {
      console.log('mount1');
    });
    const unMountFn1 = vi.fn(() => {
      console.log('unmount1');
    });
    const mountFn2 = vi.fn(() => {
      console.log('mount2');
    });
    const unMountFn2 = vi.fn(() => {
      console.log('unmount2');
    });

    const child1 = component({
      name: "child1",

      mounted: mountFn1,

      unMounted: unMountFn1,

      template() {
        return html`<div>child</div>`;
      },
    });

    const child2 = component({
      name: "child2",

      mounted: mountFn2,

      unMounted: unMountFn2,

      template() {
        return html`<div>child</div>`;
      },
    });

    const parent = component({
      name: "condition",

      data() {
        return {
          value: 0,
        };
      },

      methods: {
        trigger() {
          this.value += 1;
        },
      },

      template() {
        return html`
          <div id="app">
            <button type="button" @click=${this.trigger}>trigger</button>
            <div>${this.value}</div>
            ${this.value % 2 === 0 ? createComponent(child1) : createComponent(child2)}
          </div>
        `;
      },
    });

    rootRender(document.getElementById("root")!, parent);

    document.querySelector('button')?.click();
    await flushRaf();
    expect(unMountFn1).toHaveBeenCalled();
    expect(mountFn2).toHaveBeenCalled();

    document.querySelector('button')?.click();
    await flushRaf();
    expect(unMountFn2).toHaveBeenCalled();
    expect(mountFn1).toHaveBeenCalled();

    await flushRaf();
    expect(unMountFn1).toHaveBeenCalled();
    expect(mountFn2).toHaveBeenCalled();

    document.querySelector('button')?.click();
    await flushRaf();
    expect(unMountFn2).toHaveBeenCalled();
    expect(mountFn1).toHaveBeenCalled();
  });
})

