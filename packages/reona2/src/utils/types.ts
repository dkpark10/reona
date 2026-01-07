export type Primitive = number | string | boolean | undefined | symbol | bigint;

export type Props = Record<string, any>;
export type Data = Record<string, any>;
export type Methods = Record<string, (...args: any[]) => any>;
export type Computed = Record<string, any>;
export type ComponentKey = string;

export type RenderResult = {
  template: string;
  values: any[];
};

export type ComponentOptions<P = Props, D = Data, M = Methods, C = Computed> = {
  template($props?: P): RenderResult;

  data?: () => D;

  name?: string;

  methods?: M;

  mounted?: () => void;

  unMounted?: () => void;

  updated?: () => void;

  computed?: Record<string, () => any>;

  connect?: ((fn: () => void) => () => void)[];

  watch?: Record<string, (current: D[keyof D], prev: D[keyof D]) => void>;
} & ThisType<Props & D & M & C>;

export type ComponentInstance<
  P extends Props = Props,
  D extends Data = Data,
  M extends Methods = Methods,
  C extends Computed = Computed,
> = ComponentOptions<P, D, M, C> & {
  state: D;

  $props: P;

  $componentKey: ComponentKey;
  
  $fiberKey: Function;
};
