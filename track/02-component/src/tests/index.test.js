import { expect, test, beforeEach, afterEach } from 'vitest';
import { rootRender } from '../core/runtime-dom';
import App from '../components/parent';

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

test('컴포넌트는 재사용할 수 있어야 한다.', () => {
  rootRender(document.getElementById('root'), App);
  expect(document.querySelector('ul')?.children).toHaveLength(3);

  document.querySelector('button').click();
  const liList = document.querySelector('ul')?.children;
  expect(liList).toHaveLength(3);
  expect(liList[0].textContent).toBe('2');
  expect(liList[1].textContent).toBe('3');
  expect(liList[2].textContent).toBe('4');
});