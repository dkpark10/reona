import { html, Link, mounted } from '../../../../packages/reona-x/src/core';

export default function App() {
  mounted(() => {
    console.log('home mount');

    return () => {
      console.log('home unmount');
    };
  });

  return html`
    <div id="app">
      <div>home</div>
      ${Link(html`<div>about</div>`, { href: '/about' })}
      ${Link(html`<div>post</div>`, { href: '/post' })}
    </div>
  `;
}
