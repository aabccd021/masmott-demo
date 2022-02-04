/* eslint-disable import/exports-last */
/* eslint-disable functional/no-return-void */
import { CreateDoc, DocCreationData, DocData, DocWithId } from '.';

export type Created<DD extends DocData = DocData> = {
  readonly createdDoc: DocWithId<DD>;
  readonly reset: () => void;
  readonly state: 'created';
};

export type CreatedWithPage<DD extends DocData = DocData> = {
  readonly createdDoc: DocWithId<DD>;
  readonly redirect: () => void;
  readonly reset: () => void;
  readonly state: 'created';
};

export type Creating<DD extends DocData = DocData> = {
  readonly createdDoc: DocWithId<DD>;
  readonly state: 'creating';
};

export type Error = {
  readonly reason: unknown;
  readonly reset: () => void;
  readonly retry: () => void;
  readonly state: 'error';
};

export type Initial = { readonly state: 'initial' };

export type NotCreated<CDD extends DocCreationData = DocCreationData> = {
  readonly createDoc: CreateDoc<CDD>;
  readonly state: 'notCreated';
};

type _Type<DD extends DocData = DocData, CDD extends DocCreationData = DocCreationData> =
  | Initial
  | NotCreated<CDD>
  | Error
  | Creating<DD>;

export type TypeWithoutPage<
  DD extends DocData = DocData,
  CDD extends DocCreationData = DocCreationData
> = _Type<DD, CDD> | Created<DD>;

export type TypeWithPage<
  DD extends DocData = DocData,
  CDD extends DocCreationData = DocCreationData
> = _Type<DD, CDD> | CreatedWithPage<DD>;

export type Type<DD extends DocData = DocData, CDD extends DocCreationData = DocCreationData> =
  | TypeWithoutPage<DD, CDD>
  | TypeWithPage<DD, CDD>;
