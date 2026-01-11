import { Observable } from "../../../shared";

export default class ComputedImpl {
  private computedMap = new Map<string, unknown>();
  
  private observer = new Observable();

  constructor(rawComputed: Record<string, () => unknown>) {

  }

  public getComputedData(key: string) {
    return this.computedMap.get(key);
  }

  public invalidate(key: string, getter: () => unknown) {
    this.computedMap.set(key, getter());
  }
}
