import type { RenderResult } from "@/core/template";
import { isPrimitive } from "@/utils";

export abstract class ReonaElement<
  P extends Record<string, any> = Record<string, any>
> {
  protected $props: P;

  private $mount = false;

  constructor() { }

  setProps(props: P) {
    if (props) {
      if (isPrimitive(props)) {
        throw new Error("props는 객체형식으로 넣어야 합니다.");
      }
      this.$props = props;
    }
  }

  __mounted() {
    if (!this.$mount) {
      this.$mount = true;
      this.mounted?.();
    }
  }

  protected mounted?(): void;

  protected unmounted?(): void;

  abstract render(): RenderResult;
}
