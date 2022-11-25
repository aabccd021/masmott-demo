import {
  either,
  io,
  ioEither,
  ioOption,
  ioRef,
  option,
  readonlyRecord,
  string,
  task,
  taskEither,
} from 'fp-ts';
import { flow, pipe } from 'fp-ts/function';
import type { IO } from 'fp-ts/IO';
import type { IORef } from 'fp-ts/IORef';
import type { Option } from 'fp-ts/Option';
import validDataUrl from 'valid-data-url';

import { mkFpLocation, mkFpWindow, mkSafeLocalStorage } from './mkFp';
import type { Client, OnAuthStateChangedParam, Stack } from './type';
import { UploadDataUrlError } from './type';
import { DB, GetDownloadUrlError } from './type';

const mkRedirectUrl = ({ origin, href }: { readonly origin: string; readonly href: string }) => {
  const searchParamsStr = new URLSearchParams({ redirectUrl: href }).toString();
  return `${origin}/__masmott__/signInWithRedirect?${searchParamsStr}`;
};

type ClientEnv = {
  readonly onAuthStateChangedCallback: IORef<Option<OnAuthStateChangedParam>>;
};

export type ClientConfig = Record<string, unknown>;

export const mkClientEnv: IO<ClientEnv> = pipe(
  ioRef.newIORef<Option<OnAuthStateChangedParam>>(option.none),
  io.map((onAuthStateChangedCallback) => ({
    onAuthStateChangedCallback,
  }))
);

const authStorage = mkSafeLocalStorage(string.isString, (data) => ({
  message: 'invalid auth data loaded',
  data,
}))('auth');

const dbStorage = mkSafeLocalStorage(DB.type.is, (data, key) => ({
  code: 'ProviderError' as const,
  provider: 'mock',
  value: { message: 'invalid db data loaded', key, data },
}))('db');

const client: Client<ClientEnv, ClientConfig> = {
  storage: {
    uploadDataUrl: (env) => (param) =>
      pipe(
        param.dataUrl,
        either.fromPredicate(validDataUrl, () =>
          UploadDataUrlError.Union.of.InvalidDataUrlFormat({})
        ),
        ioEither.fromEither,
        ioEither.chainIOK(() => env.browser.getWindow),
        ioEither.map(mkFpWindow),
        ioEither.chainIOK((win) => win.localStorage.setItem(`storage/${param.key}`, param.dataUrl)),
        taskEither.fromIOEither
      ),
    getDownloadUrl: (env) => (param) =>
      pipe(
        env.browser.getWindow,
        io.map(mkFpWindow),
        io.chain((win) => win.localStorage.getItem(`storage/${param.key}`)),
        io.map(either.fromOption(() => GetDownloadUrlError.Union.of.FileNotFound({}))),
        taskEither.fromIOEither
      ),
  },
  db: {
    setDoc: (env) => (param) =>
      pipe(
        env.browser.getWindow,
        io.map((win) => dbStorage(win.localStorage)),
        io.chain((storage) =>
          pipe(
            storage.getItem,
            ioEither.map(
              flow(
                option.getOrElse(() => ({})),
                readonlyRecord.upsertAt(`${param.key.collection}/${param.key.id}`, param.data)
              )
            ),
            ioEither.chainIOK(storage.setItem)
          )
        ),
        taskEither.fromIOEither
      ),
    getDoc: (env) => (param) =>
      pipe(
        env.browser.getWindow,
        io.map((win) => dbStorage(win.localStorage)),
        io.chain((storage) => storage.getItem),
        ioEither.map(
          option.chain(readonlyRecord.lookup(`${param.key.collection}/${param.key.id}`))
        ),
        taskEither.fromIOEither
      ),
  },
  auth: {
    signInWithGoogleRedirect: (env) =>
      pipe(
        io.Do,
        io.bind('win', () => env.browser.getWindow),
        io.let('location', ({ win }) => mkFpLocation(win.location)),
        io.bind('origin', ({ location }) => location.origin),
        io.bind('href', ({ location }) => location.href.get),
        io.chain(({ location, origin, href }) => location.href.set(mkRedirectUrl({ origin, href })))
      ),
    createUserAndSignInWithEmailAndPassword: (env) => (param) =>
      pipe(
        env.browser.getWindow,
        io.map((win) => authStorage(win.localStorage)),
        io.chain((storage) => storage.setItem(param.email)),
        io.chain(() => env.provider.onAuthStateChangedCallback.read),
        ioOption.chainIOK((onChangedCallback) => onChangedCallback(option.some(param.email)))
      ),
    onAuthStateChanged: (env) => (onChangedCallback) =>
      pipe(
        env.browser.getWindow,
        io.map(mkFpWindow),
        io.chain((win) => win.localStorage.getItem('auth')),
        io.chain((lsAuth) => onChangedCallback(lsAuth)),
        io.chain(() =>
          env.provider.onAuthStateChangedCallback.write(option.some(onChangedCallback))
        ),
        io.map(() => env.provider.onAuthStateChangedCallback.write(option.none))
      ),
    signOut: (env) =>
      pipe(
        env.browser.getWindow,
        io.map(mkFpWindow),
        io.chain((win) => win.localStorage.removeItem('auth')),
        io.chain(() => env.provider.onAuthStateChangedCallback.read),
        ioOption.chainIOK((onChangedCallback) => onChangedCallback(option.none))
      ),
  },
};

export const stack: Stack<ClientEnv, ClientConfig> = {
  ci: {
    deployStorage: () => task.of(undefined),
    deployDb: () => task.of(undefined),
  },
  client,
};
