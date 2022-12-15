import type { Notebook, Timestamp } from '~/types/firebase'

import { doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { v4 } from 'uuid'

import { NOTEBOOKS_COLLECTION } from './constants'
import { getServerFirebase } from './firebase.server'

const GENERAL_NOTES = 'General notes'

export async function createFirstGeneralNotebook(ownerId: string) {
  const { firebaseDb } = getServerFirebase()

  const newNotebook: Notebook = {
    id: v4(),
    name: GENERAL_NOTES,
    ownerId,
    createdAt: serverTimestamp() as unknown as Timestamp,
  }

  const notebookDoc = doc(
    firebaseDb,
    `/${NOTEBOOKS_COLLECTION}/${newNotebook.id}`
  )

  await setDoc(notebookDoc, newNotebook)

  return newNotebook.id
}
