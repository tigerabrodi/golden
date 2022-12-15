import type { CollectionReference, DocumentReference } from 'firebase/firestore'
import type { Notebook } from '~/types/firebase'

import { doc, getDoc } from 'firebase/firestore'
import { collection, getDocs, query, where } from 'firebase/firestore'

import { NOTEBOOKS_COLLECTION, NOTES_COLLECTION } from './constants'
import { getServerFirebase } from './firebase.server'

import { NotebookSchema } from '~/types/firebase'

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
    where('ownerId', '==', ownerId)
  )

  const notebooksSnapshot = await getDocs(notebooksQuery)
  const notebooks = notebooksSnapshot.docs.map((doc) => doc.data())

  return notebooks
}

export async function getNotebook(notebookId: string): Promise<Notebook> {
  const { firebaseDb } = getServerFirebase()

  const notebookDoc = doc(
    firebaseDb,
    `/${NOTEBOOKS_COLLECTION}/${notebookId}`
  ) as DocumentReference<Notebook>
  const notebookSnapshot = await getDoc(notebookDoc)

  const notebook = notebookSnapshot.data()

  return NotebookSchema.parse(notebook)
}

export async function getNotesInsideNotebookByNotebookId(
  notebookId: string
): Promise<Array<Notebook>> {
  const { firebaseDb } = getServerFirebase()

  const notesCollection = collection(
    firebaseDb,
    `/${NOTEBOOKS_COLLECTION}/${notebookId}/${NOTES_COLLECTION}`
  ) as CollectionReference<Notebook>

  const notesSnapshot = await getDocs(notesCollection)
  const notebooks = notesSnapshot.docs.map((doc) => doc.data())

  return notebooks
}
