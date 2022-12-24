import type { CollectionReference } from 'firebase/firestore'
import type { Note } from '~/types'

import { collection } from 'firebase/firestore'
import { onSnapshot } from 'firebase/firestore'
import { useEffect, useState } from 'react'

import { NOTEBOOKS_COLLECTION, NOTES_COLLECTION } from '~/firebase'
import { useFirebase } from '~/providers/FirebaseProvider'

export function useGetNotesSubscription({
  initialNotes,
  notebookId,
}: {
  initialNotes: Array<Note>
  notebookId: string
}) {
  const firebaseContext = useFirebase()
  const [notes, setNotes] = useState(initialNotes)

  useEffect(() => {
    if (firebaseContext?.firebaseDb) {
      const noteDocRef = collection(
        firebaseContext?.firebaseDb,
        `${NOTEBOOKS_COLLECTION}/${notebookId}/${NOTES_COLLECTION}`
      ) as CollectionReference<Note>

      const unSubscribe = onSnapshot(noteDocRef, (notesSnapshot) => {
        const newNotes = notesSnapshot.docs.map((note) => note.data())

        if (newNotes) {
          setNotes(newNotes)
        }
      })

      return () => {
        unSubscribe()
      }
    }
  }, [firebaseContext, notebookId])

  return { notes }
}
