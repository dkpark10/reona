import { expect, test, beforeEach, afterEach } from 'vitest';
import { rootRender } from '../core/runtime-dom';
import App from '../components';

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

test('조건부 렌더링에 따른 서로 다른 컴포넌트 인스턴스를 렌더링 해야 한다.', async () => {
  rootRender(document.getElementById('root'), App);
  expect(document.getElementById('child1')).toBeInTheDocument();

  document.querySelector('button').click();
  expect(document.getElementById('child2')).toBeInTheDocument();

  document.querySelector('button').click();
  expect(document.getElementById('child1')).toBeInTheDocument();
});