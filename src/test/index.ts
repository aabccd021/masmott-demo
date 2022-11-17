import { either as E, task as T } from 'fp-ts';
import { pipe } from 'fp-ts/function';
import { describe, expect, test } from 'vitest';

import { GetDocError, GetDownloadUrlError, MkStack } from '../type';

export const independencyTests = (mkStack: MkStack) => {
  describe('storage is independent between tests', () => {
    test('a server can upload file kira', async () => {
      const result = pipe(
        T.Do,
        T.bind('stack', () => T.fromIO(mkStack)),
        T.chainFirst(({ stack }) => stack.deployStorage({ securityRule: { type: 'allowAll' } })),
        T.chainFirst(({ stack }) =>
          stack.clientStorageUpload({ key: 'kira_key', file: 'kira_content', format: 'base64' })
        ),
        T.chain(({ stack }) => stack.clientStorageGetDownloadUrl({ key: 'kira_key' })),
        T.map(E.isRight)
      );
      expect(await result()).toEqual(true);
    });

    test('server from another test can not access file kira', async () => {
      const result = pipe(
        T.Do,
        T.bind('stack', () => T.fromIO(mkStack)),
        T.chainFirst(({ stack }) => stack.deployStorage({ securityRule: { type: 'allowAll' } })),
        T.chain(({ stack }) => stack.clientStorageGetDownloadUrl({ key: 'kira_key' }))
      );
      expect(await result()).toEqual(E.left(GetDownloadUrlError.Union.as.FileNotFound({})));
    });
  });

  describe('db is independent between tests', () => {
    test('a server can create document kira', async () => {
      const result = pipe(
        T.Do,
        T.bind('stack', () => T.fromIO(mkStack)),
        T.chainFirst(({ stack }) => stack.deployDb({ securityRule: { type: 'allowAll' } })),
        T.chainFirst(({ stack }) =>
          stack.clientDbSetDoc({
            key: { collection: 'user', id: 'kira_id' },
            data: { name: 'masumoto' },
          })
        ),
        T.chain(({ stack }) => stack.clientDbGetDoc({ key: { collection: 'user', id: 'kira_id' } }))
      );
      expect(await result()).toEqual(E.right({ name: 'masumoto' }));
    });

    test('server from another test can not access document kira', async () => {
      const result = pipe(
        T.Do,
        T.bind('stack', () => T.fromIO(mkStack)),
        T.chainFirst(({ stack }) => stack.deployDb({ securityRule: { type: 'allowAll' } })),
        T.chain(({ stack }) => stack.clientDbGetDoc({ key: { collection: 'user', id: 'kira_id' } }))
      );
      expect(await result()).toEqual(E.left(GetDocError.Union.as.DocNotFound({})));
    });
  });
};
