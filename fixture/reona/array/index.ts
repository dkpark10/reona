import { component, html, createComponent } from '../../../packages/reona/src/core';
import arrayChild from './array-child';

export default component({
  name: 'array',

  data() {
    return {
      arr: [1, 2, 3, 4, 5],
    }
  },

  template() {
    return html`
      <div>
        <ul>
          ${this.arr.map((item) => createComponent(arrayChild, {
            props: {
              value: item,
            },
          }))}
        </ul>
        <ul>
          ${this.arr.map((item) => html`<li>${item}</li>`)}
        </ul>                  
      </div>
    `;
  },
});
