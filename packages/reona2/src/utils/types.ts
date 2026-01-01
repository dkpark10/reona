export type Primitive = number | string | boolean | undefined | symbol | bigint;

export type Props = Record<string, any>;
export type Data = Record<string, any>;
export type Methods = Record<string, () => void>;

export type RenderResult = {
  template: string;
  values: any[];
};

export type ComponentOptions<Props, D = Data, M = Methods> = {
  template($props?: Props): RenderResult;

  data?: () => D;

  name?: string;

  methods?: M;

  mounted?: () => void;

  unMounted?: () => void;

  updated?: () => void;

  watch?: Record<string, (current: D[keyof D], prev: D[keyof D]) => void>;
} & ThisType<Props & D & M>;

export type ComponentInstance<
  P extends Props = Props,
  D extends Data = Data,
  M extends Methods = Methods
> = ComponentOptions<P, D, M> & {
  state?: D;

  setProps?: (props: P) => void;

  props?: P;
};
