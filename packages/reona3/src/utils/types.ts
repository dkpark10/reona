export type Primitive = number | string | boolean | undefined | symbol | bigint;

export type Props = Record<string, any>;

export type RenderResult = {
  template: string;
  values: any[];
};

export type Component<P = any> = (props: P) => RenderResult;

export type LifeCycleType = 'mounted' | 'updated' | 'unmounted';