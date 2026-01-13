import { beforeEach, afterEach, vi, expect, test } from 'vitest';
import { rootRender } from '../core/runtime-dom';
import { flushRaf } from './utils';
import { component, html } from '../core/component';

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

test('동일한 fiber에 대해 리렌더링을 로직은 배치에 넣어 한번만 실행되어야 한다.', async () => {
  const comp = component<{}, { val1: number; val2: number }, { trigger: () => void }>({
    name: 'counter',

    data() {
      return {
        val1: 0,
        val2: 0,
        val3: 0,
      };
    },

    methods: {
      trigger() {
        this.val1 += 2;
        this.val2 += 2;
        this.val3 += 2;
      },
    },

    template() {
      return html`
        <div id="app">
          <button type="button" @click=${this.trigger}>트리거</button>
          <div>${this.val1}</div>
          <div>${this.val2}</div>
          <div>${this.val3}</div>
        </div>
      `;
    },
  });

  const fiber = rootRender(document.getElementById('root')!, comp);
  const mockFn = vi.fn();
  fiber.reRender = mockFn;

  (document.querySelector('button') as HTMLButtonElement)?.click();
  await flushRaf();
  expect(mockFn).toHaveBeenCalledOnce();
});
