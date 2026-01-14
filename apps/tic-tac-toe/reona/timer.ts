import { component, html } from 'reona';

export default component<
  { beginCountTrigger: boolean },
  { count: number; intervalId: number | null }
>({
  name: 'timer',

  data() {
    return {
      intervalId: null,
      count: 0,
    }
  },

  template() {
    // todo props watch 반응형
    if (this.$props.beginCountTrigger && !this.intervalId) {
      this.intervalId = setInterval(() => {
        this.count += 1;
      }, 1_000);
    }

    return html`<time>시간: ${this.count}</time>`;
  },
});
