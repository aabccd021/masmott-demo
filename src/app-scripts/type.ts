import type { DeepPartial } from 'ts-essentials/dist/types';

import type { StackWithEnv } from '../type';

export type StackOption = { readonly stack: DeepPartial<StackWithEnv>; readonly name: string };

export type Param = {
  readonly stacks: {
    readonly env?: Record<string, StackOption>;
    readonly default: StackOption;
  };
};