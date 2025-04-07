import {
  DocumentData,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  SnapshotOptions,
  Timestamp,
} from 'firebase/firestore'; // Adjust import path as needed

import * as models from './models';

/**
 * Creates a Firestore data converter for a generic type T.
 * This converter handles conversion between Firestore documents and TypeScript objects,
 * including proper handling of Timestamps and maintaining specified ID fields.
 *
 * @template T - The type of the model object extending a basic object with string keys
 * @param {string} idField - The name of the ID field to be used in the model
 * @return {FirestoreDataConverter<T>} A Firestore converter for the specified type
 */
function createGenericConverter<T extends Record<string, unknown>>(
  idField: keyof T & string,
): FirestoreDataConverter<T> {
  return {
    toFirestore(modelObject: T): DocumentData {
      const data: DocumentData = {};
      for (const key in modelObject) {
        if (key !== idField && Object.prototype.hasOwnProperty.call(modelObject, key)) {
          const value = modelObject[key];
          data[key] =
            value && typeof value === 'object' && value instanceof Date
              ? Timestamp.fromDate(value) // If true, TS knows value is Date
              : value;
        }
      }
      return data;
    },

    fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): T {
      const rawData = snapshot.data(options);
      const dataWithId: any = {
        [idField]: snapshot.id,
      };

      for (const key in rawData) {
        if (Object.prototype.hasOwnProperty.call(rawData, key)) {
          const value = rawData[key];
          if (value && typeof value === 'object' && value instanceof Date) {
            dataWithId[key] = Timestamp.fromDate(value);
          } else {
            dataWithId[key] = value;
          }
        }
      }
      return dataWithId as T;
    },
  };
}

export const userConverter = createGenericConverter<models.User>('userId');
export const campusConverter = createGenericConverter<models.Campus>('campusId');
export const projectConverter = createGenericConverter<models.Project>('projectId');
export const testRequestConverter =
  createGenericConverter<models.TestRequest>('requestId');
export const bugReportConverter = createGenericConverter<models.BugReport>('reportId');
