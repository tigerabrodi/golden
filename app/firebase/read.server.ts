import type { CollectionReference, DocumentReference } from 'firebase/firestore'
import type { Note, Notebook } from '~/types/firebase'

import { collectionGroup, orderBy } from 'firebase/firestore'
import { doc, getDoc } from 'firebase/firestore'
import { collection, getDocs, query, where } from 'firebase/firestore'

import {
  CREATED_AT,
  NOTEBOOKS_COLLECTION,
  NOTES_COLLECTION,
  OWNER_ID,
} from './constants'
import { getServerFirebase } from './firebase.server'

export async function getUserNotebooks(
  ownerId: string
): Promise<Array<Notebook>> {
  const { firebaseDb } = getServerFirebase()

  const notebooksCollection = collection(
    firebaseDb,
    NOTEBOOKS_COLLECTION
  ) as CollectionReference<Notebook>
  const notebooksQuery = query(
    notebooksCollection,
    where(OWNER_ID, '==', ownerId)
  )

  const notebooksSnapshot = await getDocs(notebooksQuery)
  const notebooks = notebooksSnapshot.docs.map((doc) => doc.data())

  return notebooks
}

export async function getNotebook(
  notebookId: string
): Promise<Notebook | undefined> {
  const { firebaseDb } = getServerFirebase()

  const notebookDoc = doc(
    firebaseDb,
    `/${NOTEBOOKS_COLLECTION}/${notebookId}`
  ) as DocumentReference<Notebook>
  const notebookSnapshot = await getDoc(notebookDoc)

  const notebook = notebookSnapshot.data()

  return notebook
}

export async function getNotesInsideNotebookByNotebookId(
  notebookId: string
): Promise<Array<Note>> {
  const { firebaseDb } = getServerFirebase()

  const notesCollection = collection(
    firebaseDb,
    `/${NOTEBOOKS_COLLECTION}/${notebookId}/${NOTES_COLLECTION}`
  ) as CollectionReference<Note>

  const notesSnapshot = await getDocs(notesCollection)
  const notes = notesSnapshot.docs.map((doc) => doc.data())

  return notes
}

export async function getUserNotes(ownerId: string): Promise<Array<Note>> {
  const { firebaseDb } = getServerFirebase()

  const notesCollection = collectionGroup(
    firebaseDb,
    NOTES_COLLECTION
  ) as CollectionReference<Note>

  const notesQuery = query(
    notesCollection,
    where(OWNER_ID, '==', ownerId),
    orderBy(CREATED_AT, 'asc')
  )

  const notesSnapshot = await getDocs(notesQuery)
  const notes = notesSnapshot.docs.map((doc) => doc.data())

  return notes
}

export async function getNote({
  notebookId,
  noteId,
}: {
  notebookId: string
  noteId: string
}): Promise<Note | undefined> {
  const { firebaseDb } = getServerFirebase()

  const noteDoc = doc(
    firebaseDb,
    `/${NOTEBOOKS_COLLECTION}/${notebookId}/${NOTES_COLLECTION}/${noteId}`
  ) as DocumentReference<Note>
  const noteSnapshot = await getDoc(noteDoc)
  const note = noteSnapshot.data()

  return note
}
