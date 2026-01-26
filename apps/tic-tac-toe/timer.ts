import { mounted, html, state, ref, watchProps } from 'reona';

interface TimerProps {
  beginCountTrigger: boolean;
}

export default function Timer({ beginCountTrigger }: TimerProps) {
  const data = state({
    count: 0,
  });

  const timer = ref<{ id: number | null }>({
    id: null,
  });

  watchProps<TimerProps>(() => {
    if (beginCountTrigger) {
      timer.current.id = setInterval(() => {
        data.count += 1;
      }, 1_000);
    }

    if (!beginCountTrigger && timer.current.id) {
      clearInterval(timer.current.id);
      data.count = 0;
      return;
    }
  });

  mounted(() => {
    return () => {
      if (timer.current.id) {
        clearInterval(timer.current.id);
      }
    }
  });

  return html`<time>시간: ${data.count}</time>`;
}
