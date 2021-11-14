// eslint-disable-next-line import/no-cycle
import { CreateDoc, DocCreationData, DocCreationData, DocWithId } from '.';

export type Created<DD extends DocCreationData = DocCreationData> = {
  readonly state: 'created';
  readonly createdDoc: DocWithId<DD>;
  readonly reset: () => void;
};

export type Creating<DD extends DocCreationData = DocCreationData> = {
  readonly state: 'creating';
  readonly createdDoc: DocWithId<DD>;
};

export type Error = {
  readonly state: 'error';
  readonly reason: unknown;
  readonly retry: () => void;
  readonly reset: () => void;
};

export type Initial = { readonly state: 'initial' };

export type NotCreated<CDD extends DocCreationData = DocCreationData> = {
  readonly state: 'notCreated';
  readonly createDoc: CreateDoc<CDD>;
};

export type Type<DD extends DocCreationData = DocCreationData, CDD extends DocCreationData = DocCreationData> =
  | Initial
  | NotCreated<CDD>
  | Error
  | Creating<DD>
  | Created<DD>;
