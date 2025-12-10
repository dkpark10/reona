import type { ReturnHtml } from "@/core/html";
import { isPrimitive } from "@/utils";

export abstract class ReonaElement<P extends Record<string, any> = Record<string, any>> {
  protected $props: P;

  constructor(props?: P) {
    if (props) {
      if (isPrimitive(props)) {
        throw new Error("props는 객체형식으로 넣어야 합니다.");
      }
      this.$props = props;
    }
  }

  abstract render(): ReturnHtml;
}
