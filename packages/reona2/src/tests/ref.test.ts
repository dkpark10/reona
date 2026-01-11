import { expect, test, beforeEach, afterEach } from "vitest";
import store from "../../../../fixture/store";
import { rootRender } from "../core/runtime-dom";
import { flushRaf } from "./utils";

beforeEach(() => {
  const div = document.createElement('div');
  div.id = 'root';
  document.body.appendChild(div);
});

afterEach(() => {
  document.body.removeChild(document.getElementById('root')!);
});
