// eslint-disable-next-line no-restricted-imports
import { App } from 'firebase-admin/app';
// eslint-disable-next-line no-restricted-imports
import {
  DocumentSnapshot as FirestoreDocumentSnapshot,
  FieldValue,
  getFirestore,
  GrpcStatus,
} from 'firebase-admin/firestore';
import {
  DocumentData,
  DocumentSnapshot,
  QuerySnapshot,
  WriteDocumentData,
} from '../type';

/**
 * Type safe and convenience firebase-admin wrapper
 */

export type { App };
export { FieldValue, GrpcStatus };

export function wrapFirebaseSnapshot(
  snapshot: FirestoreDocumentSnapshot
): DocumentSnapshot {
  return { id: snapshot.id, data: snapshot.data() ?? {} };
}

export async function getDoc(
  app: App,
  collectionName: string,
  documentId: string
): Promise<DocumentSnapshot> {
  const snapshot = await getFirestore(app)
    .doc(`${collectionName}/${documentId}`)
    .get();
  const wrappedSnapshot = wrapFirebaseSnapshot(snapshot);
  return wrappedSnapshot;
}

export function deleteDoc(
  app: App,
  collectionName: string,
  documentId: string
): Promise<FirebaseFirestore.WriteResult> {
  return getFirestore(app).doc(`${collectionName}/${documentId}`).delete();
}

export function createDoc(
  app: App,
  collectionName: string,
  documentId: string,
  data: DocumentData
): Promise<FirebaseFirestore.WriteResult> {
  return getFirestore(app).doc(`${collectionName}/${documentId}`).create(data);
}

export function updateDoc(
  app: App,
  collectionName: string,
  documentId: string,
  data: WriteDocumentData
): Promise<FirebaseFirestore.WriteResult> {
  return getFirestore(app).doc(`${collectionName}/${documentId}`).update(data);
}

export async function getCollection(
  app: App,
  collectionName: string,
  query?: (
    collectionRef: FirebaseFirestore.CollectionReference<DocumentData>
  ) => FirebaseFirestore.Query<DocumentData>
): Promise<QuerySnapshot> {
  const collectionRef = getFirestore(app).collection(collectionName);
  const collectionQuery =
    query === undefined ? collectionRef : query(collectionRef);
  const snapshot = await collectionQuery.get();
  const wrappedDocs = snapshot.docs.map(wrapFirebaseSnapshot);
  const wrappedQuerySnapshot = {
    docs: wrappedDocs,
  };
  return wrappedQuerySnapshot;
}