import type { TaskEither } from 'fp-ts/TaskEither';

import type { Stack } from '..';

export type Param = {
  readonly functions: {
    readonly path: string;
    readonly exportName: string;
  };
  readonly server: Stack.server.Type;
};

type Error = {
  readonly code: 'FailedLoadingFunctions';
  readonly details?: unknown;
};

export type Fn = (
  c: Param
) => TaskEither<Error & { readonly capability: 'ci.deployFunctions' }, undefined | void>;
