import { html, mounted, unMounted, watchProps } from '../../../packages/reona-x/src/core';

interface ChildProps {
  value: number;
}

export default function Child({ value }: ChildProps) {
  mounted(() => {
    console.log('mounted child');
  });

  unMounted(() => {
    console.log('unMounted child');
  });

  watchProps<ChildProps>((prev) => {
    console.log(prev);
  });

  return html`
    <div>${value}</div>
  `;
}
