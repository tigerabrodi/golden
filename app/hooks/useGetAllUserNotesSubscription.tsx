import type { CollectionReference } from 'firebase/firestore'
import type { Note } from '~/types'

import { collectionGroup, orderBy, query, where } from 'firebase/firestore'
import { onSnapshot } from 'firebase/firestore'
import { useEffect, useState } from 'react'

import { CREATED_AT, NOTES_COLLECTION, OWNER_ID } from '~/firebase'
import { useFirebase } from '~/providers/FirebaseProvider'

export function useGetAllUserNotesSubscription({
  initialNotes,
  ownerId,
}: {
  initialNotes: Array<Note>
  ownerId: string
}) {
  const firebaseContext = useFirebase()
  const [notes, setNotes] = useState(initialNotes)

  useEffect(() => {
    if (firebaseContext?.firebaseDb) {
      const notesCollection = collectionGroup(
        firebaseContext.firebaseDb,
        NOTES_COLLECTION
      ) as CollectionReference<Note>

      const notesQuery = query(
        notesCollection,
        where(OWNER_ID, '==', ownerId),
        orderBy(CREATED_AT, 'asc')
      )

      const unSubscribe = onSnapshot(notesQuery, (notesSnapshot) => {
        const newNotes = notesSnapshot.docs.map((note) => note.data())

        if (newNotes) {
          setNotes(newNotes)
        }
      })

      return () => {
        unSubscribe()
      }
    }
  }, [firebaseContext, ownerId])

  return { notes }
}
