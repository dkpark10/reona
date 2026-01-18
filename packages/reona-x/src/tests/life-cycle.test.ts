import { beforeEach, afterEach, vi, expect, test, describe } from 'vitest';
import {
  mounted,
  unMounted,
  state,
  html,
  createComponent,
  rootRender,
  updated,
} from '../core';
import {
  mountHooks,
  unMountHooks,
  updatedHooks,
  getInstanceMap,
  watchPropsHooks,
} from '../core/component-instance';
import { ref, states, watchProps, refs } from '../core/hooks';
import { flushRaf } from './utils';
import { createKey } from '../../../shared';

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
  test('리렌더링 되어도 마운트 훅 실행은 1번이 보장 되어야 한다.', async () => {
    const mountFn = vi.fn();

    function Component() {
      const data = state({
        bool: true,
      });

      mounted(mountFn);

      const trigger = () => {
        data.bool = !data.bool;
      };

      return html`
        <div id="app">
          <button type="button" @click=${trigger}>trigger</button>
        </div>
      `;
    }
    const instance = rootRender(document.getElementById('root')!, Component);

    document.querySelector('button')?.click();
    await flushRaf();
    expect(mountFn).toHaveBeenCalledOnce();

    document.querySelector('button')?.click();
    await flushRaf();
    expect(mountFn).toHaveBeenCalledOnce();

    expect(mountHooks.get(instance)).toBeUndefined();
  });

  test('마운트 훅의 개수만큼 실행이 되야 하고 마운트 직후 마운트훅 맵을 클리어 한다.', async () => {
    const mountFn1 = vi.fn();
    const mountFn2 = vi.fn();
    const mountFn3 = vi.fn();

    function Component() {
      mounted(mountFn1);
      mounted(mountFn2);
      mounted(mountFn3);

      return html`
        <div id="app"></div>
      `;
    }
    const instance = rootRender(document.getElementById('root')!, Component);

    await flushRaf();
    expect(mountFn1).toHaveBeenCalledOnce();
    expect(mountFn2).toHaveBeenCalledOnce();
    expect(mountFn3).toHaveBeenCalledOnce();

    expect(mountHooks.get(instance)).toBeUndefined();
  });

  test('업데이트 훅 실행을 테스트 한다.', async () => {
    let expectedValue;
    const updatedFn = vi.fn((prev) => {
      expectedValue = prev;
    });
    const updatedFn2 = vi.fn();

    function Component() {
      const data = state({
        value: 1,
      });
      const data2 = state({
        value: 1,
      });

      updated(data, updatedFn);
      updated(data2, updatedFn2);

      const trigger = () => {
        data.value += 1;
      };

      const noop = () => {
        data2.value = data2.value;
      };

      return html`
        <div id="app">
          <button type="button" data-testid="btn1" @click=${trigger}>trigger</button>
          <button type="button" data-testid="btn2" @click=${noop}>noop</button>
        </div>
      `;
    }
    rootRender(document.getElementById('root')!, Component);

    (document.querySelector('button[data-testid="btn1"]') as HTMLButtonElement).click();
    await flushRaf();
    expect(updatedFn).toHaveBeenCalledTimes(1);
    expect(expectedValue).toEqual({ value: 1 });

    (document.querySelector('button[data-testid="btn1"]') as HTMLButtonElement).click();
    await flushRaf();
    expect(updatedFn).toHaveBeenCalledTimes(2);
    expect(expectedValue).toEqual({ value: 2 });

    (document.querySelector('button[data-testid="btn2"]') as HTMLButtonElement).click();
    await flushRaf();
    expect(updatedFn2).not.toHaveBeenCalled();

    (document.querySelector('button[data-testid="btn2"]') as HTMLButtonElement).click();
    await flushRaf();
    expect(updatedFn2).not.toHaveBeenCalled();
  });

  test('언마운트 훅의 개수만큼 실행이 되야 하고 마운트 직후 언마운트훅 맵을 클리어 한다.', async () => {
    const unMountFn1 = vi.fn();
    const unMountFn2 = vi.fn();
    const unMountFn3 = vi.fn();

    function Child() {
      unMounted(unMountFn1);
      unMounted(unMountFn2);
      unMounted(unMountFn3);

      return html`
        <div></div>
      `;
    }

    function Component() {
      const data = state({
        bool: true,
      });

      const trigger = () => {
        data.bool = !data.bool;
      };

      return html`
        <div id="app">
          <button type="button" @click=${trigger}>trigger</button>
          ${data.bool ? createComponent(Child) : ''}
        </div>
      `;
    }

    rootRender(document.getElementById('root')!, Component);

    const instanceMap = getInstanceMap();
    const instance = instanceMap.get(Child)?.get(createKey(1));

    document.querySelector('button')?.click();

    await flushRaf();
    expect(unMountFn1).toHaveBeenCalledOnce();
    expect(unMountFn2).toHaveBeenCalledOnce();
    expect(unMountFn3).toHaveBeenCalledOnce();
    expect(unMountHooks.get(instance!)).toBeUndefined();
  });

  test('조건부 렌더링에 따른 마운트, 언마운트 훅을 테스트를 한다.', async () => {
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

    function Child({ value }: { value: number }) {
      mounted(mountFn1);
      unMounted(unMountFn1);
      return html`<div id="div1">${value}</div>`;
    }

    function Child2({ value }: { value: number }) {
      mounted(mountFn2);
      unMounted(unMountFn2);
      return html`<div id="div2">${value}</div>`;
    }

    function Parent() {
      const data = state({
        bool: true,
      });

      const trigger = () => {
        data.bool = !data.bool;
      };

      return html`
        <div id="app">
          <button type="button" @click=${trigger}>trigger</button>
          ${data.bool
          ? createComponent(Child, {
            props: {
              value: 1,
            },
          })
          : createComponent(Child2, {
            props: {
              value: 2,
            },
          })}
        </div>
      `;
    }

    rootRender(document.getElementById('root')!, Parent);

    expect(document.getElementById('div1')).toBeInTheDocument();
    expect(document.getElementById('div1')?.textContent).toBe('1');

    document.querySelector('button')?.click();
    await flushRaf();
    expect(unMountFn1).toHaveBeenCalled();
    expect(mountFn2).toHaveBeenCalled();
    expect(document.getElementById('div2')).toBeInTheDocument();
    expect(document.getElementById('div2')?.textContent).toBe('2');

    document.querySelector('button')?.click();
    await flushRaf();
    expect(unMountFn2).toHaveBeenCalled();
    expect(mountFn1).toHaveBeenCalled();
    expect(document.getElementById('div1')).toBeInTheDocument();
    expect(document.getElementById('div1')?.textContent).toBe('1');

    document.querySelector('button')?.click();
    await flushRaf();
    expect(unMountFn1).toHaveBeenCalled();
    expect(mountFn2).toHaveBeenCalled();
    expect(document.getElementById('div2')).toBeInTheDocument();
    expect(document.getElementById('div2')?.textContent).toBe('2');

    document.querySelector('button')?.click();
    await flushRaf();
    expect(unMountFn2).toHaveBeenCalled();
    expect(mountFn1).toHaveBeenCalled();
    expect(document.getElementById('div1')).toBeInTheDocument();
    expect(document.getElementById('div1')?.textContent).toBe('1');
  });

  test('언마운트 시 해당 컴포넌트의 훅 데이터들이 정리되어야 한다.', async () => {
    const mountFn = vi.fn(() => {
      console.log('mount1');
    });
    const unMountFn = vi.fn(() => {
      console.log('unmount1');
    });
    const updatedFn1 = vi.fn();
    const updatedFn2 = vi.fn();
    const watchPropsFn = vi.fn();

    function Child({ value }: { value: number; }) {
      const data1 = state({
        noop: null,
      });
      const data2 = state({
        noop: null,
      });
      const refValue = ref(123);
      refValue.current;

      mounted(mountFn);
      updated(data1, updatedFn1);
      updated(data2, updatedFn2)
      unMounted(unMountFn);
      watchProps(watchPropsFn);

      return html`<div>${value}</div>`;
    }

    function Parent() {
      const data = state({
        bool: true,
      });

      const trigger = () => {
        data.bool = !data.bool;
      };

      return html`
        <div id="app">
          <button type="button" @click=${trigger}>trigger</button>
          ${data.bool ? createComponent(Child, { props: { value: 1 } }) : ''}
        </div>
      `;
    }

    rootRender(document.getElementById('root')!, Parent);

    document.querySelector('button')?.click();
    await flushRaf();

    const instanceMap = getInstanceMap();
    const instance = instanceMap.get(Child)?.get(createKey(1));

    expect(states.get(instance!)).toBeUndefined();
    expect(unMountHooks.get(instance!)).toBeUndefined();
    expect(updatedHooks.get(instance!)).toBeUndefined();
    expect(mountHooks.get(instance!)).toBeUndefined();
    expect(watchPropsHooks.get(instance!)).toBeUndefined();
    expect(refs.get(instance!)).toBeUndefined();
  });
});
