import type { Component, RenderResult } from "../utils/types";
import { createComponent, html } from "./component";

function isRenderResultObject(obj: any): obj is RenderResult {
  return (
    obj !== null &&
    typeof obj === 'object' &&
    typeof obj.template === 'string' &&
    Array.isArray(obj.values)
  );
}

export function createContext<T extends unknown>(defaultValue: T) {
  let ctxData = defaultValue;
  let isProvided = false;

  function provider({ value, children }: {
    value?: T, children: Component | RenderResult;
  }) {
    if (value) {
      ctxData = value;
    }
    isProvided = true;
    if (isRenderResultObject(children)) {
      return children;
    }
    return html`${createComponent(children)}`
  }

  function getContextData() {
    if (!isProvided) {
      throw new Error('context는 provider 내부에서만 사용할 수 있습니다.');
    }
    return ctxData;
  }

  return {
    provider,
    getContextData,
  }
};
