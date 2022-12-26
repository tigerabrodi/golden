import type { loader as noteLoader } from './notebooks.$notebookId.$noteId'
import type { DataFunctionArgs } from '@remix-run/node'
import type { Status } from '~/types'

import { json } from '@remix-run/node'
import { Link, useLoaderData, useParams, useTransition } from '@remix-run/react'
import { doc, updateDoc } from 'firebase/firestore'
import debounce from 'lodash.debounce'
import { useCallback, useEffect, useState } from 'react'
import { zx } from 'zodix'

import { IS_NEWLY_CREATED } from './notebooks.$notebookId'

import { NOTEBOOKS_COLLECTION, NOTES_COLLECTION } from '~/firebase'
import { useLoaderRouteData } from '~/hooks'
import { useGetNoteSubscription } from '~/hooks/useGetNoteSubscription'
import { CloudCheck, Delete, Eye } from '~/icons'
import { useFirebase } from '~/providers'

export const NOTE_NAME = 'noteName'

export const loader = async ({ request }: DataFunctionArgs) => {
  const { isNewlyCreated } = zx.parseQuery(request, {
    [IS_NEWLY_CREATED]: zx.BoolAsString.optional(),
  })

  return json({ isNewlyCreated })
}

export default function Note() {
  const { isNewlyCreated } = useLoaderData<typeof loader>()
  const noteLoaderData = useLoaderRouteData<typeof noteLoader>(
    'routes/notebooks.$notebookId.$noteId'
  )
  const transition = useTransition()
  const firebaseContext = useFirebase()
  const { notebookId } = useParams<{ notebookId: string }>()

  const [savingNameStatus, setSavingNameStatus] = useState<Status>('idle')
  const savingLabel = savingNameStatus === 'loading' ? 'Saving' : 'Saved'

  if (!noteLoaderData || !notebookId) {
    throw new Error('Note/notebook not found')
  }

  const { initialNote } = noteLoaderData

  const { note, setNote } = useGetNoteSubscription({
    initialNote,
    notebookId,
  })

  // useCallback is required for debounce to work
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleNoteNameChange = useCallback(
    debounce(async (noteName: string) => {
      if (firebaseContext?.firebaseDb) {
        setSavingNameStatus('loading')
        const noteDoc = doc(
          firebaseContext.firebaseDb,
          // Using initial id here because note.id could be stale
          `/${NOTEBOOKS_COLLECTION}/${notebookId}/${NOTES_COLLECTION}/${initialNote.id}`
        )
        await updateDoc(noteDoc, { name: noteName })
        setSavingNameStatus('success')
      }
    }, 500),
    [firebaseContext]
  )

  const isNavigatingToAnotherNote = transition.state === 'loading'
  const isSubscribedNoteStale = note.id !== initialNote.id
  const isNoteNameTheSame = initialNote.name === note.name
  const shouldNotUpdateNoteName =
    isNavigatingToAnotherNote || isNoteNameTheSame || isSubscribedNoteStale

  useEffect(() => {
    if (shouldNotUpdateNoteName) {
      return
    }

    handleNoteNameChange(note.name)?.catch((error) => {
      console.error(error)
      setSavingNameStatus('error')
    })
  }, [note.name, shouldNotUpdateNoteName, handleNoteNameChange])

  return (
    <>
      <div className="header">
        <input
          type="text"
          aria-label="Note name"
          id={NOTE_NAME}
          name={NOTE_NAME}
          autoFocus={isNewlyCreated}
          value={note.name}
          onChange={(event) =>
            setNote((prevNote) => ({
              ...prevNote,
              name: event.target.value,
            }))
          }
        />
        <Link to="../view" className="edit-view" prefetch="intent">
          <span>View</span>
          <Eye className="eye" />
        </Link>

        <div className="status" role="status" aria-label={savingLabel}>
          <CloudCheck />
          <span>{savingLabel}</span>
        </div>

        <Link to="../delete" className="delete" prefetch="intent">
          <span>Delete</span>
          <Delete />
        </Link>
      </div>

      <textarea name="content" aria-label="Markdown content" />
    </>
  )
}
