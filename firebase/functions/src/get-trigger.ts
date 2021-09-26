import * as _ from 'lodash';
import * as admin from 'firebase-admin';
import { Collections, JoinSpec } from './type';
import * as functions from 'firebase-functions';

function mergeObjectArray<T>(
  objectArray: readonly { readonly [key: string]: T }[]
): { readonly [key: string]: T } {
  return objectArray.reduce(
    (acc, object) => ({
      ...acc,
      ...object,
    }),
    {}
  );
}

function getSelectedDocumentData(
  data: FirebaseFirestore.DocumentData,
  selectedFieldNames: readonly string[] | undefined
): FirebaseFirestore.DocumentData {
  if (selectedFieldNames === undefined) {
    return {};
  }

  const selectedDocumentData = _.pick(data, selectedFieldNames);
  return selectedDocumentData;
}

async function getDocumentDataFromJoinSpec(
  data: FirebaseFirestore.DocumentData,
  { refCollectionName, refFieldName, selectedFieldNames }: JoinSpec
): Promise<FirebaseFirestore.DocumentData> {
  const refId = data[refFieldName];

  const refDoc = await admin
    .firestore()
    .collection(refCollectionName)
    .doc(refId)
    .get();

  const selectedDocumentData = _.pick(refDoc.data(), selectedFieldNames);
  return selectedDocumentData;
}

async function getJoinedDocumentData(
  data: FirebaseFirestore.DocumentData,
  specs: readonly JoinSpec[] | undefined
): Promise<FirebaseFirestore.DocumentData> {
  if (specs === undefined) {
    return {};
  }

  const documentDataPromises = specs.map((spec) =>
    getDocumentDataFromJoinSpec(data, spec)
  );

  const documentDataArray = await Promise.all(documentDataPromises);

  const documentData = mergeObjectArray(documentDataArray);

  return documentData;
}

export function getTrigger(collections: Collections): void {
  _.mapValues(collections, (collection, collectionName) =>
    _.mapValues(
      collection.view,
      ({ selectedFieldNames, joinSpecs }, viewName) => {
        const viewCollectionRef = admin
          .firestore()
          .collection(`${collectionName}_${viewName}`);

        const onCreateFunction = functions.firestore
          .document(`${collectionName}/{documentId}`)
          .onCreate((snapshot) => {
            const selectedDocumentData = getSelectedDocumentData(
              snapshot.data(),
              selectedFieldNames
            );

            const joinedDocumentData = getJoinedDocumentData(
              snapshot.data(),
              joinSpecs
            );

            return viewCollectionRef.doc(snapshot.id).set(
              {
                ...selectedDocumentData,
                ...joinedDocumentData,
              },
              { merge: true }
            );
          });

        return onCreateFunction;
      }
    )
  );
}
