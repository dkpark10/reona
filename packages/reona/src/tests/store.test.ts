import { expect, test, beforeEach, afterEach } from 'vitest';
import store from '../../../../fixture/reona/store';
import { rootRender } from '../core/runtime-dom';
import { flushRaf } from './utils';

beforeEach(() => {
  const div = document.createElement('div');
  div.id = 'root';
  document.body.appendChild(div);
});

afterEach(() => {
  document.body.removeChild(document.getElementById('root')!);
});

test('전역 스토어 값 업데이트 시 형제 컴포넌트 값도 변경되어야 한다.', async () => {
  rootRender(document.getElementById('root')!, store);

  (document.querySelector('button[data-testid="trigger"]') as HTMLButtonElement)?.click();
  await flushRaf();
  expect(document.querySelector('div[data-testid="store1"]')?.textContent).toBe('10000');
  expect(document.querySelector('div[data-testid="store2"]')?.textContent).toBe('10000');

  (document.querySelector('button[data-testid="trigger"]') as HTMLButtonElement)?.click();
  await flushRaf();
  expect(document.querySelector('div[data-testid="store1"]')?.textContent).toBe('10001');
  expect(document.querySelector('div[data-testid="store2"]')?.textContent).toBe('10001');

  (document.querySelector('button[data-testid="trigger"]') as HTMLButtonElement)?.click();
  await flushRaf();
  expect(document.querySelector('div[data-testid="store1"]')?.textContent).toBe('10002');
  expect(document.querySelector('div[data-testid="store2"]')?.textContent).toBe('10002');
});
