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

describe('컴포넌트 테스트', () => {
  test('data 변경 시 값의 변경과 watch 콜백을 호출하여야 한다.', () => {
    /**
     * @data price: 5,
      quantity: 2,
     */
    const instance = component<
      {},
      { price: number; quantity: number },
      { increase: () => void; decrease: () => void },
      { double: number }
    >({
      name: 'counter',

      data() {
        return {
          price: 5,
          quantity: 2,
        };
      },

      watch: {
        price(current, prev) {
          console.log(current, prev);
        },

        quantity(current, prev) {
          console.log(current, prev);
        },
      },

      methods: {
        increase() {
          this.quantity += 2;
        },

        decrease() {
          this.quantity -= 2;
        },
      },

      template() {
        return html`
          <div id="app">
            <button type="button" @click=${this.increase}>증가</button>
            <button type="button" @click=${this.decrease}>감소</button>
            <section>
              <div>가격: ${this.price}</div>
              <div>수량: ${this.quantity}</div>
              <div>합산: ${this.quantity * this.price}</div>
              <div>더블: ${this.double}</div>
            </section>
          </div>
        `;
      },
    })();

    type WatchType = Record<keyof ReturnType<NonNullable<typeof instance.data>>, () => void>;

    const spyWatch = vi.spyOn(instance.watch as WatchType, 'quantity');

    instance.increase();
    expect(instance.state!.quantity).toBe(4);
    expect(spyWatch).toHaveBeenCalledWith(4, 2);

    instance.decrease();
    expect(instance.state!.quantity).toBe(2);
    expect(spyWatch).toHaveBeenCalledWith(2, 4);
  });

  test('props를 보여주고 컴포넌트는 재사용 가능한 새로운 인스턴스여야 한다.', () => {
    const child = component<{ value: string }>({
      template() {
        return html`<div id="${this.$props.value}">child</div>`;
      },
    });

    const parent = component({
      template() {
        return html`
          <div id="app">
            ${createComponent(child, {
              props: {
                value: 'props1',
              },
            })}
            ${createComponent(child, {
              props: {
                value: 'props2',
              },
            })}
            ${createComponent(child, {
              props: {
                value: 'props3',
              },
            })}
          </div>
        `;
      },
    });

    rootRender(document.getElementById('root')!, parent);
    expect(document.getElementById('props1')).toBeInTheDocument();
    expect(document.getElementById('props2')).toBeInTheDocument();
    expect(document.getElementById('props3')).toBeInTheDocument();
  });

  test('여러겹으로 중첩된 컴포넌트를 테스트한다.', async () => {
    const grandSon = component<{ value: number }>({
      name: 'grand-son',

      template() {
        return html` <div id="grand-son">
          <div>${this.$props.value * 2}</div>
        </div>`;
      },
    });

    const son = component<{ value: number }>({
      name: 'son',

      template() {
        return html` <div>
          <div id="son">${this.$props.value * 2}</div>
          ${createComponent(grandSon, {
            props: {
              value: this.$props.value * 2,
            },
          })}
        </div>`;
      },
    });

    const nested = component<{}, { value: number }, { trigger: () => void }>({
      name: 'nested',

      data() {
        return {
          value: 2,
        };
      },

      methods: {
        trigger() {
          this.value += 2;
        },
      },

      template() {
        return html` <div id="app">
          <button type="button" @click=${this.trigger}>트리거</button>
          <div>값: ${this.value}</div>
          ${createComponent(son, {
            props: {
              value: this.value,
            },
          })}
        </div>`;
      },
    });

    rootRender(document.getElementById('root')!, nested);

    expect(document.getElementById('son')?.textContent).toBe('4');
    expect(document.getElementById('grand-son')?.textContent).toBe('8');

    document.querySelector('button')?.click();
    await flushRaf();
    expect(document.getElementById('son')?.textContent).toBe('8');
    expect(document.getElementById('grand-son')?.textContent).toBe('16');

    document.querySelector('button')?.click();
    await flushRaf();
    expect(document.getElementById('son')?.textContent).toBe('12');
    expect(document.getElementById('grand-son')?.textContent).toBe('24');
  });

  test('ref 값을 테스트 한다.', async () => {
    let result: unknown;
    const ref = component({
      name: 'counter',

      mounted() {
        result = this.$refs.hh;
      },

      template() {
        return html` <div id="app">
          <h1 $$ref="hh">hh</h1>
        </div>`;
      },
    });

    rootRender(document.getElementById('root')!, ref);
    await flushMicrotasks();
    expect((result as HTMLHeadingElement).tagName).toBe('H1');
    expect((result as HTMLHeadingElement).textContent).toBe('hh');
  });
});
