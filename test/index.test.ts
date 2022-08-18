import * as E from 'fp-ts/Either';
import { describe, expect, it } from 'vitest';

import { AppViews, makeTriggers } from '../src';
import { createMockDB } from './util';

describe.concurrent('masmott', () => {
  describe.concurrent('self field', () => {
    const views: AppViews = {
      lawak: {
        card: {
          fields: {
            text: {
              relation: 'self',
            },
          },
        },
      },
    };

    describe.concurrent('onCreate', () => {
      it('returns success messages', async () => {
        const db = createMockDB();
        const triggers = makeTriggers({ db, views });
        const trigger = triggers.db.lawak.onCreate({
          id: 'fooLawak',
          data: { text: 'lawak text' },
        });

        const result = await trigger();

        expect(result).toStrictEqual({ card: E.right('setDoc success') });
      });

      it('creates materialized view', async () => {
        const db = createMockDB();
        const triggers = makeTriggers({ db, views });
        const trigger = triggers.db.lawak.onCreate({
          id: 'fooLawak',
          data: { text: 'lawak text' },
        });

        await trigger();

        const getViewDoc = db.getDoc({ table: 'lawak', view: 'card', id: 'fooLawak' });
        const result = await getViewDoc();
        expect(result).toStrictEqual(
          E.right({
            data: { text: 'lawak text' },
            context: 'doc found',
          })
        );
      });

      it('only copies specified fields to view doc', async () => {
        const db = createMockDB();
        const triggers = makeTriggers({ db, views });
        const trigger = triggers.db.lawak.onCreate({
          id: 'fooLawak',
          data: { text: 'lawak text', anotherText: 'anotherText' },
        });

        await trigger();

        const getViewDoc = db.getDoc({ table: 'lawak', view: 'card', id: 'fooLawak' });
        const result = await getViewDoc();
        expect(result).toStrictEqual(
          E.right({
            data: { text: 'lawak text' },
            context: 'doc found',
          })
        );
      });
    });
  });
});