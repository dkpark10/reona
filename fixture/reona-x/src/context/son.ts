import { html, context } from '../../../../packages/reona-x/src/core';
import { darkMode } from './ctx-data';

export default function ContextApp() {
  const value = context(darkMode);
  return html`<span>${value.mode}</span>`;
}
