import { describe, expect, test } from 'vitest';
import Parser from '../core/parser';
import Fiber from '../core/fiber';
import { html, component, createComponent } from '../core/component';

describe('파서 테스트', () => {
  test('vdom 생성값을 테스트 한다.', () => {
    const func = () => { };

    const props = 123;
    const price = 5;
    const quantity = 2;

    const template = html` <div id="app">
      <button type="button" @click=${func}>증가</button>
      <button type="button" @click=${func}>감소</button>
      <section>
        <div>props: ${props} ${props} ${props}</div>
        <div>가격: ${price}</div>
        <div>수량: ${quantity}</div>
        <div>합산: ${price * quantity}</div>
      </section>
    </div>`;

    expect(new Parser(template).parse()).toEqual({
      type: 'element',
      tag: 'div',
      children: [
        {
          type: 'element',
          tag: 'button',
          children: [
            {
              type: 'text',
              value: '증가',
            },
          ],
          attr: { type: 'button', '@click': func },
        },
        {
          type: 'element',
          tag: 'button',
          children: [
            {
              type: 'text',
              value: '감소',
            },
          ],
          attr: { type: 'button', '@click': func },
        },
        {
          type: 'element',
          tag: 'section',
          children: [
            {
              children: [
                {
                  type: 'text',
                  value: `props: ${props} ${props} ${props}`,
                },
              ],
              tag: 'div',
              type: 'element',
            },
            {
              children: [
                {
                  type: 'text',
                  value: `가격: ${price}`,
                },
              ],
              tag: 'div',
              type: 'element',
            },
            {
              children: [
                {
                  type: 'text',
                  value: `수량: ${quantity}`,
                },
              ],
              tag: 'div',
              type: 'element',
            },
            {
              children: [
                {
                  type: 'text',
                  value: `합산: ${quantity * price}`,
                },
              ],
              tag: 'div',
              type: 'element',
            },
          ],
        },
      ],
      attr: { id: 'app' },
    });
  });

  test('중첩 컴포넌트가 있을 때 vdom 값을 테스트 한다.', () => {
    const child = component({
      data() {
        return {
          a: 12,
        };
      },

      methods: {
        foo() { },
      },

      template() {
        return html``;
      },
    });

    const template = html` <div id="app">${createComponent(child, {})}</div>`;

    expect(new Parser(template).parse()).toEqual({
      type: 'element',
      tag: 'div',
      children: [{ type: 'component', fiber: expect.any(Fiber) }],
      attr: { id: 'app' },
    });
  });

  test('배열 vdom 값을 테스트 한다.', () => {
    const template = html` <ul id="list">
      ${[1, 2, 3].map((item) => html`<li>${item}</li>`)}
    </ul>`;

    expect(new Parser(template).parse()).toEqual({
      type: 'element',
      tag: 'ul',
      attr: { id: 'list' },
      children: [
        {
          type: 'element',
          tag: 'li',
          children: [
            {
              type: 'text',
              value: '1',
            },
          ],
        },
        {
          type: 'element',
          tag: 'li',
          children: [
            {
              type: 'text',
              value: '2',
            },
          ],
        },
        {
          type: 'element',
          tag: 'li',
          children: [
            {
              type: 'text',
              value: '3',
            },
          ],
        },
      ],
    });
  });

  test('중첩 컴포넌트 배열 vdom 값을 테스트 한다.', () => {
    const child = component<{ value: number }>({
      template() {
        return html`<li>${this.$props.value}</li>`;
      },
    });

    const template = html` <div id="app">
      <ul>
        ${[1, 2, 3].map((item) =>
      createComponent(child, {
        props: {
          value: item,
        },
      })
    )}
      </ul>
      <ul>
        ${[1, 2, 3].map((item) => html`<li>${item}</li>`)}
      </ul>
    </div>`;

    expect(new Parser(template).parse()).toEqual({
      type: 'element',
      tag: 'div',
      attr: { id: 'app' },
      children: [
        {
          type: 'element',
          tag: 'ul',
          children: [
            {
              type: 'component',
              fiber: expect.any(Fiber),
            },
            {
              type: 'component',
              fiber: expect.any(Fiber),
            },
            {
              type: 'component',
              fiber: expect.any(Fiber),
            },
          ],
        },
        {
          type: 'element',
          tag: 'ul',
          children: [
            {
              type: 'element',
              tag: 'li',
              children: [
                {
                  type: 'text',
                  value: '1',
                },
              ],
            },
            {
              type: 'element',
              tag: 'li',
              children: [
                {
                  type: 'text',
                  value: '2',
                },
              ],
            },
            {
              type: 'element',
              tag: 'li',
              children: [
                {
                  type: 'text',
                  value: '3',
                },
              ],
            },
          ],
        },
      ],
    });
  });

  test('속성에 동적 값이 존재할 시 테스트 한다.', () => {
    const template = html`<div class="${'c1'} ${'c2'} ${'c3'}" id="app ${'foo'} ${'bar'}">123</div>`;

    expect(new Parser(template).parse()).toEqual({
      type: 'element',
      tag: 'div',
      children: [{ type: 'text', value: '123' }],
      attr: { 
        id: 'app foo bar',
        class: 'c1 c2 c3',
      },
    });
  });

  test('속성 이름 자체가 marker인 경우를 테스트 한다.', () => {
    const template = html`<input type="text" ${true ? 'checked' : ''}></input>`;

    expect(new Parser(template).parse()).toEqual({
      type: 'element',
      tag: 'input',
      children: [],
      attr: { 
        type: 'text',
        checked: true,
      },
    });
  });
});
