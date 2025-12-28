export type Primitive = number | string | boolean | undefined | symbol | bigint;

export type Props = Record<string, any>;
export type Data = Record<string, any>;
export type Methods = Record<string, () => void>;

export type RenderResult = {
  template: string;
  values: any[];
  doc: Document;
};

export type ComponentOptions<Props, D = Data, M = Methods> = {
  data: () => D;

  name?: string;

  render($props?: Props): RenderResult;

  methods: M;

  mounted?: () => void;

  unMounted?: () => void;

  updated?: () => void;

  state?: D;

  setProps?: (props: Props) => void;

  props?: Props;

  watch?: Record<string, (current: D[keyof D], prev: D[keyof D]) => void>;
} & ThisType<Props & D & M>;
