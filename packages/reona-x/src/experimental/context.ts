import type { RenderResult } from "../utils/types";

export function createContext<T extends unknown>(defaultValue: T) {
  let ctxData = defaultValue;
  let isProvided = false;

  function provider({ value, children }: {
    value?: T, children: RenderResult
  }) {
    if (value) {
      ctxData = value;
    }
    isProvided = true;
    return children;
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
