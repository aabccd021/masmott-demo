import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { GetVFTriggerContext, VFTrigger } from '../type';

export type StringSFSpec = {
  readonly type: 'string';
};

export type StringVFSpec = {
  readonly type: 'string';
};

export function getStringVFTrigger(
  { viewCollectionName, vfName, viewName }: GetVFTriggerContext,
  _: StringVFSpec
): VFTrigger {
  return {
    onSrcCreate: functions.firestore
      .document(`${viewCollectionName}/{documentId}`)
      .onCreate((snapshot) => {
        const srcData = snapshot.data()?.[vfName];

        if (typeof srcData !== 'string') {
          functions.logger.error('Invalid Type', { snapshot });
          return 1;
        }

        return admin
          .firestore()
          .collection(`${viewCollectionName}_${viewName}`)
          .doc(snapshot.id)
          .set(
            {
              [vfName]: srcData,
            },
            { merge: true }
          );
      }),
    onSrcUpdate: functions.firestore
      .document(`${viewCollectionName}/{documentId}`)
      .onUpdate((change) => {
        const srcDataBefore = change.before.data()?.[vfName];
        const srcDataAfter = change.after.data()?.[vfName];

        if (
          typeof srcDataBefore !== 'string' ||
          typeof srcDataAfter !== 'string'
        ) {
          functions.logger.error('Invalid Type', { change });
          return 1;
        }

        if (srcDataBefore === srcDataAfter) {
          return 0;
        }

        return admin
          .firestore()
          .collection(`${viewCollectionName}_${viewName}`)
          .doc(change.after.id)
          .set(
            {
              [vfName]: srcDataAfter,
            },
            { merge: true }
          );
      }),
    onSrcDelete: functions.firestore
      .document(`${viewCollectionName}/{documentId}`)
      .onDelete((snapshot) =>
        admin
          .firestore()
          .collection(`${viewCollectionName}_${viewName}`)
          .doc(snapshot.id)
          .delete()
      ),
  };
}
