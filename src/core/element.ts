import type { RenderResult } from "@/core/template";
import { isPrimitive } from "@/utils";

export abstract class ReonaElement<
  P extends Record<string, any> = Record<string, any>
> {
  protected $props: P;
  
  private $key: number | string;

  private __mounted = false;

  private __children = new Map<string, ReonaElement>();

  constructor(props?: P) {
    if (props) {
      if (isPrimitive(props)) {
        throw new Error("props는 객체형식으로 넣어야 합니다.");
      }
      this.$props = props;
    }
  }

  // 마운트 1회는 같은 인스턴스임.
  __markMounted() {
    if (this.__mounted) return;
    this.__mounted = true;
    this.mounted?.();
  }

  protected mounted?(): void;

  protected unmounted?(): void;

  protected use<T extends ReonaElement>(key: string, factory: () => T): T {
    if (!this.__children.has(key)) {
      this.__children.set(key, factory());
    }
    return this.__children.get(key)! as T;
  }

  abstract render(): RenderResult;
}
