import { io, taskEither } from 'fp-ts';
import { pipe } from 'fp-ts/function';
import { Window } from 'happy-dom';

import { mkEnvFromWindow, stack } from '../src';
import type { StackType } from '../src/stack/type';
import { runSuiteWithConfig, runTestWithConfig } from '../src/test';
import type { Suite } from '../src/test/util';

const getTestEnv = pipe(
  mkEnvFromWindow(() => io.of(new Window())),
  io.map((env) => ({ server: env, ci: env, client: env })),
  taskEither.fromIO
);

export const runTest = runTestWithConfig<StackType>({ stack, getTestEnv });

export const runSuite = runSuiteWithConfig<StackType>({ stack, getTestEnv });

export const runSuiteConcurrent = (param: { readonly suite: Suite }) =>
  runSuite({ ...param, suite: { ...param.suite, concurrent: true } });