import { beforeEach, afterEach, vi, expect, test } from 'vitest';
import { rootRender } from '../core/runtime-dom';
import { flushRaf } from './utils';
import comp from "../../../../fixture/render-optimize";

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
  const fiber = rootRender(document.getElementById('root')!, comp);
  const mockFn = vi.fn();
  fiber.reRender = mockFn;

  (document.querySelector('button') as HTMLButtonElement)?.click();
  await flushRaf();
  expect(mockFn).toHaveBeenCalledOnce();
})
