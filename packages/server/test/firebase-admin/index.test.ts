import { assert } from 'chai';
import * as firestore from 'firebase-admin/firestore';
import sinon, { stubInterface } from 'ts-sinon';
import {
  createDoc,
  deleteDoc,
  getCollection,
  getDoc,
  updateDoc,
} from '../../src/firebase-admin';
import * as adminUtil from '../../src/firebase-admin/util';
import { App, DocumentSnapshot } from '../../src/type';
import * as util from '../../src/util';

describe('firebase-admin', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('getDoc', () => {
    it('gets the document', async () => {
      // arrange
      const firestoreSnapshot = stubInterface<firestore.DocumentSnapshot>();
      const firestoreSnapshot2 = stubInterface<firestore.DocumentSnapshot>();

      const mockedDocRef = stubInterface<firestore.DocumentReference>();
      mockedDocRef.get.resolves(firestoreSnapshot);

      const getDocRef = sinon
        .stub(adminUtil, 'getDocRef')
        .returns(mockedDocRef);

      const snapshot = stubInterface<DocumentSnapshot>();

      const wrapFirebaseSnapshot = sinon
        .stub(util, 'wrapFirebaseSnapshot')
        .returns(snapshot);

      const app = stubInterface<App>();

      // act
      const wrappedSnapshot = await getDoc(app, 'fooCollection', 'barId');

      // assert
      assert.isTrue(getDocRef.calledOnceWith(app, 'fooCollection', 'barId'));
      assert.isTrue(mockedDocRef.get.calledOnceWith());

      assert.isTrue(wrapFirebaseSnapshot.calledOnceWith(firestoreSnapshot));
      assert.isFalse(wrapFirebaseSnapshot.calledOnceWith(firestoreSnapshot2));

      assert.equal(wrappedSnapshot, snapshot);
    });
  });

  describe('deleteDoc', () => {
    it('deletes the document', async () => {
      // arrange
      const mockedDeleteResult = stubInterface<firestore.WriteResult>();

      const mockedDocRef = stubInterface<firestore.DocumentReference>();
      mockedDocRef.delete.resolves(mockedDeleteResult);

      const getDocRef = sinon
        .stub(adminUtil, 'getDocRef')
        .returns(mockedDocRef);

      const app = stubInterface<App>();

      // act
      const deleteResult = await deleteDoc(app, 'fooCollection', 'barId');

      // assert
      assert.isTrue(getDocRef.calledOnceWith(app, 'fooCollection', 'barId'));
      assert.isTrue(mockedDocRef.delete.calledOnceWith());
      assert.deepStrictEqual(deleteResult, mockedDeleteResult);
    });
  });

  describe('createDoc', () => {
    it('creates  document', async () => {
      // arrange
      const mockedCreateResult = stubInterface<firestore.WriteResult>();
      const mockedCreateResult2 = stubInterface<firestore.WriteResult>();

      const mockedDocRef = stubInterface<firestore.DocumentReference>();
      mockedDocRef.create.resolves(mockedCreateResult);

      const getDocRef = sinon
        .stub(adminUtil, 'getDocRef')
        .returns(mockedDocRef);

      const app = stubInterface<App>();
      const app2 = stubInterface<App>();

      const data = stubInterface<firestore.DocumentData>();
      const data2 = stubInterface<firestore.DocumentData>();

      // act
      const createResult = await createDoc(app, 'fooCollection', 'barId', data);

      // assert
      assert.isTrue(getDocRef.calledOnceWith(app, 'fooCollection', 'barId'));
      assert.isFalse(getDocRef.calledOnceWith(app2, 'fooCollection', 'barId'));

      assert.isTrue(mockedDocRef.create.calledOnceWith(data));
      assert.isFalse(mockedDocRef.create.calledOnceWith(data2));

      assert.equal(createResult, mockedCreateResult);
      assert.notEqual(createResult, mockedCreateResult2);
    });
  });

  describe('updateDoc', () => {
    it('updates the  document', async () => {
      // arrange
      const mockedUpdateResult = stubInterface<firestore.WriteResult>();
      const mockedUpdateResult2 = stubInterface<firestore.WriteResult>();

      const mockedDocRef = stubInterface<firestore.DocumentReference>();
      mockedDocRef.update.resolves(mockedUpdateResult);

      const getDocRef = sinon
        .stub(adminUtil, 'getDocRef')
        .returns(mockedDocRef);

      const app = stubInterface<App>();
      const app2 = stubInterface<App>();

      const data = stubInterface<firestore.DocumentData>();
      const data2 = stubInterface<firestore.DocumentData>();

      // act
      const updateResult = await updateDoc(app, 'fooCollection', 'barId', data);

      // assert
      assert.isTrue(getDocRef.calledOnceWith(app, 'fooCollection', 'barId'));
      assert.isFalse(getDocRef.calledOnceWith(app2, 'fooCollection', 'barId'));

      assert.isTrue(
        (mockedDocRef.update as sinon.SinonStub).calledOnceWith(data)
      );
      assert.isFalse(
        (mockedDocRef.update as sinon.SinonStub).calledOnceWith(data2)
      );

      assert.equal(updateResult, mockedUpdateResult);
      assert.notEqual(updateResult, mockedUpdateResult2);
    });
  });

  describe('getCollection', () => {
    it('returns collection', async () => {
      // arrange
      const querySnapshot = stubInterface<firestore.QueryDocumentSnapshot>();
      const mockedDocs = [querySnapshot];

      const mockedQueryResult: firestore.QuerySnapshot = {
        ...stubInterface<firestore.QuerySnapshot>(),
        docs: mockedDocs,
      };

      const collection = stubInterface<firestore.CollectionReference>();
      collection.get.resolves(mockedQueryResult);

      const firestoreInstance = stubInterface<firestore.Firestore>();
      firestoreInstance.collection.returns(collection);

      const getFirestore = sinon
        .stub(firestore, 'getFirestore')
        .returns(firestoreInstance);

      const snapshot = stubInterface<DocumentSnapshot>();

      const wrapFirebaseSnapshot = sinon
        .stub(util, 'wrapFirebaseSnapshot')
        .returns(snapshot);

      const app = stubInterface<App>();

      // act
      const queryResult = await getCollection(app, 'fooCollection');

      // assert
      assert.isTrue(getFirestore.calledOnceWith(app));
      assert.isTrue(
        firestoreInstance.collection.calledOnceWith('fooCollection')
      );
      assert.isTrue(collection.get.calledOnceWith());
      assert.isTrue(wrapFirebaseSnapshot.calledOnceWith(querySnapshot));
      const expectedQueryResult = {
        docs: [snapshot],
      };
      assert.deepStrictEqual(queryResult, expectedQueryResult);
    });

    it('returns collection with query', async () => {
      // arrange
      const querySnapshot = stubInterface<firestore.QueryDocumentSnapshot>();
      const mockedDocs = [querySnapshot];

      const mockedQueryResult: firestore.QuerySnapshot = {
        ...stubInterface<firestore.QuerySnapshot>(),
        docs: mockedDocs,
      };

      const queryObj = stubInterface<firestore.Query>();
      queryObj.get.resolves(mockedQueryResult);

      const collection = stubInterface<firestore.CollectionReference>();
      collection.where.returns(queryObj);

      const firestoreInstance = stubInterface<firestore.Firestore>();
      firestoreInstance.collection.returns(collection);

      const getFirestore = sinon
        .stub(firestore, 'getFirestore')
        .returns(firestoreInstance);

      const snapshot = stubInterface<DocumentSnapshot>();

      const wrapFirebaseSnapshot = sinon
        .stub(util, 'wrapFirebaseSnapshot')
        .returns(snapshot);

      const app = stubInterface<App>();

      // act
      const queryResult = await getCollection(
        app,
        'fooCollection',
        (collection) => collection.where('foo', '!=', 'bar')
      );

      // assert
      assert.isTrue(getFirestore.calledOnceWith(app));
      assert.isTrue(
        firestoreInstance.collection.calledOnceWith('fooCollection')
      );
      assert.isTrue(collection.where.calledOnceWith('foo', '!=', 'bar'));
      assert.isTrue(queryObj.get.calledOnceWith());
      assert.isTrue(wrapFirebaseSnapshot.calledOnceWith(querySnapshot));
      const expectedQueryResult = {
        docs: [snapshot],
      };
      assert.deepStrictEqual(queryResult, expectedQueryResult);
    });
  });
});
