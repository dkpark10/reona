import { ref } from "@/core/reactivity";
import { html } from "@/core/html";
import { ReonaElement } from "@/core/element";

export class Timer extends ReonaElement {
  private intervalTimer: ReturnType<typeof setInterval> | null = null;
  
  private timer = ref(this.getHHMMRR());

  mounted() {
    this.intervalTimer = setInterval(() => {
      this.timer.value = this.getHHMMRR();
    }, 1_000);
  }

  /** @todo unmounted 구현 */
  unMounted() {
    if (this.intervalTimer) {
      clearInterval(this.intervalTimer);
    }
  }

  getHHMMRR() {
    const [hour, minute, second] = new Date()
      .toISOString()
      .slice(11, 19)
      .split(":");
    return `${hour}:${minute}:${second}`;
  }

  render() {
    return html`<time>time: ${this.timer.value}</time>`;
  }
}
