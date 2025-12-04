// vdom과 비슷한 역할
class FiberNode {
  private id: number | string;

  // 다음 fiber
  private nextNode: FiberNode | null = null;

  constructor(id: number | string) {
    this.id = id;
  }

  getNextNode() {
    return this.nextNode;
  }
}
