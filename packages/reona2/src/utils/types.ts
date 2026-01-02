export type Primitive = number | string | boolean | undefined | symbol | bigint;

export type Props = Record<string, any>;
export type Data = Record<string, any>;
export type Methods = Record<string, () => void>;
export type Computed = any;
export type ComponentKey = string;

export type RenderResult = {
  template: string;
  values: any[];
};

export type ComponentOptions<Props, D = Data, M = Methods, C = Computed> = {
  template($props?: Props): RenderResult;

  data?: () => D;

  name?: string;

  methods?: M;

  mounted?: () => void;

  unMounted?: () => void;

  updated?: () => void;

  computed?: Record<string, () => any>;

  watch?: Record<string, (current: D[keyof D], prev: D[keyof D]) => void>;
} & ThisType<Props & D & M & C>;

export type ComponentInstance<
  P extends Props = Props,
  D extends Data = Data,
  M extends Methods = Methods,
  C extends Computed = Computed,
> = ComponentOptions<P, D, M, C> & {
  state: D;

  $props: Props;

  $componentKey: ComponentKey;
};
