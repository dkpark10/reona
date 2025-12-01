/**
 * @param {string[]} strings 
 * @param  {any[]} values 
 * @returns {string}
 */
export function html (strings, ...values) {
  return strings.reduce((acc, str, i) => {
    const token = Array.isArray(values[i]) ? values[i].join("") : values[i];
    return acc + str + (token ?? "");
  }, "");
}
