import { ReonaElement } from "@/core/element";

export type Primitive = number | string | boolean | undefined | symbol | bigint;

/** @description element의 prop type을 추출 */
export type ExtractElementProps<E> = E extends new () => ReonaElement<infer P> ? P : never;
