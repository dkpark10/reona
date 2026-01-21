import { state } from './hooks'

/**
 * @param {string[]} strings 
 * @param  {any[]} values 
 */
function html(strings, ...values) {
  let idx = 0;
  const rawString = strings
    .join('%%identifier%%')
    .replace(/%%identifier%%/g, () => `__marker_${idx++}__`);

  return { template: rawString, values };
}

export {
  state, html
};
