import { expect, test, beforeEach, afterEach } from 'vitest';
import { rootRender } from '../core/runtime-dom';
import App from '../components/counter';

const flushRaf = () => new Promise((resolve) => requestAnimationFrame(() => resolve()));

beforeEach(() => {
  const div = document.createElement('div');
  div.id = 'root';
  document.body.appendChild(div);
});

afterEach(() => {
  if (document.getElementById('root')) {
    document.body.removeChild(document.getElementById('root'));
  }
});

test('상태는 변경되어야 한다.', async () => {
  rootRender(document.getElementById('root'), App);

  document.querySelector('[data-testid="increase"]').click();
  await flushRaf();
  expect(document.getElementById('value').textContent).toBe('1');

  document.querySelector('[data-testid="decrease"]').click();
  await flushRaf();
  expect(document.getElementById('value').textContent).toBe('0');
});