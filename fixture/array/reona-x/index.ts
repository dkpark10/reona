import { html, createComponent } from '../../../packages/reona-x/src/core';
import ArrayChild from './array-child';

export default function Array() {
  const arr = [1, 2, 3, 4, 5];

    return html`
      <div>
        <ul>
          ${arr.map((item) => createComponent(ArrayChild, {
            props: {
              value: item,
            },
          }))}
        </ul>
        <ul>
          ${arr.map((item) => html`<li>${item}</li>`)}
        </ul>                  
      </div>
  `;
}
