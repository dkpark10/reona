import { html, createComponent } from '../../../../packages/reona-x/src/core';
import { darkMode } from './ctx-data';
import Son from './son';

export default function ContextApp() {
  return darkMode.provider({
    value: { mode: 'dark' },
    children: html`
      <div>
        <div>123123</div>
        ${createComponent(Son)}
      </div>
    `,
  })
}
