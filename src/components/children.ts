import { html } from "@/core/template";
import { ReonaElement } from "@/core/element";

interface ChildrenProps {
  quantity: number;
}

export class Children extends ReonaElement<ChildrenProps> {
  constructor(props: ChildrenProps) {
    super(props);
  }

  render() {
    return html`<div>children...${this.$props.quantity + 12}</div> `;
  }
}
