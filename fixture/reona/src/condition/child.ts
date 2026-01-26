import { html, mounted, watchProps } from '../../../../packages/reona/src/core';

interface ChildProps {
  value: number;
}

export default function Child({ value }: ChildProps) {
  mounted(() => {
    console.log('mounted child1');
    return () => {
      console.log('unMounted child1');
    }
  });

  watchProps<ChildProps>((prev) => {
    console.log(prev);
  });

  return html`
    <div>${value}</div>
  `;
}
