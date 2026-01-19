import { watchProps, createComponent, html } from 'reona-x';
import GrandSon from './grand-son';

interface SonProps {
  value: number;
}

export default function Son({ value }: SonProps) {
  watchProps<SonProps>((prev) => {
    console.log('watch son', prev.value);
  });

  return html`
    <div>
      <div>값: ${value}</div>
      ${createComponent(
        GrandSon, {
          props: {
            value: value * 2,
          },
        },
      )}
    </div>`;
}