import type { DocumentReference } from 'firebase/firestore'
import type { Note } from '~/types'

import { doc } from 'firebase/firestore'
import { onSnapshot } from 'firebase/firestore'
import { useEffect, useState } from 'react'

import { NOTEBOOKS_COLLECTION, NOTES_COLLECTION } from '~/firebase'
import { useFirebase } from '~/providers/FirebaseProvider'

export function useGetNoteSubscription({
  initialNote,
  notebookId,
}: {
  initialNote: Note
  notebookId: string
}) {
  const firebaseContext = useFirebase()
  const [note, setNote] = useState(initialNote)

  useEffect(() => {
    if (firebaseContext?.firebaseDb) {
      const noteDocRef = doc(
        firebaseContext?.firebaseDb,
        `${NOTEBOOKS_COLLECTION}/${notebookId}/${NOTES_COLLECTION}/${initialNote.id}`
      ) as DocumentReference<Note>

      const unSubscribe = onSnapshot(noteDocRef, (noteSnapshot) => {
        const newNote = noteSnapshot.data()
        if (newNote) {
          setNote(newNote)
        }
      })

      return () => {
        unSubscribe()
      }
    }
  }, [firebaseContext, initialNote.id, notebookId])

  return { note, setNote }
}
