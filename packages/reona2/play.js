const div = document.createElement('div');

div.id = 'didi';

console.log(document.getElementById('didi'));

const div2 = document.createElement('div');
console.log(div2 === div);

export function bar(obj) {
  return obj;
}