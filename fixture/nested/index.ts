import { createComponent, component, html } from '../../packages/reona/src/core';
import son from './son';

export default component<
  {},
  { value: number; },
  { trigger: () => void; }
>({
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
    return html`
      <div id="app">
        <button type="button" @click=${this.trigger}>트리거</button>
        <div>값: ${this.value}</div>
        ${createComponent(
          son, {
            props: {
              value: this.value,
            },
          },
        )}
      </div>
    `;
  },
});

