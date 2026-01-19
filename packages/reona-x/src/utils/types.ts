export type Primitive = number | string | boolean | undefined | symbol | bigint;

export type Props = Record<string, any>;

export type Data = Record<string, any>;

export type RenderResult = {
  template: string;
  values: any[];
};

export type Component<P = any> = (props: P) => RenderResult;

export interface Context<T> {
  provider: ({ value, children }: {
    value?: T;
    children: RenderResult;
  }) => RenderResult;

  getContextData: () => T;
}
