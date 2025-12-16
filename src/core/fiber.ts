import { generateId } from "@/utils";
import type { ReonaElement } from "./element";

const components = new WeakMap<ReonaElement, ReturnType<typeof generateId>>();

// vdom과 비슷한 역할
class Fiber {
  private Component: new () => ReonaElement<any>;

  private componentId: number;

  constructor(Component: new () => ReonaElement<any>) {
    this.Component = Component;
    this.componentId = generateId();
  }

  foo() {
    components.set(new this.Component(), this.componentId);
  }
}
