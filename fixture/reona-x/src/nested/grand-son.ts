import { html, watchProps } from '../../../../packages/reona-x/src/core';

interface GrandSonProps {
  value: number;
}

export default function Grand({ value }: GrandSonProps) {
  watchProps<GrandSonProps>((prev) => {
    console.log('watch grand-son', prev.value);
  });

  return html`
    <div>
      <div>값: ${value}</div>
    </div>`;
}