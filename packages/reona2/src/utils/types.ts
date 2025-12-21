export type Primitive = number | string | boolean | undefined | symbol | bigint;

export type Props = Record<string, any>;
export type Data = Record<string, any>;
export type Methods = Record<string, () => void>;

export type RenderResult = {
  template: string;
  values: any[];
};

export type ComponentOptions<P = Props, D = Data, M = Methods> = {
  data: () => D;
  render(): RenderResult;
  methods: M;
  mounted?: () => void;
  unMounted?: () => void;
  updated?: () => void;
  state?: D;
  setProps?: (props: P) => void;
  props?: P;
} & ThisType<P & D & M>;
