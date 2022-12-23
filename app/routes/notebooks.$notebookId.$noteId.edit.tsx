import type { loader as noteLoader } from './notebooks.$notebookId.$noteId'
import type { Status } from '~/types'

import { Link } from '@remix-run/react'
import { useState } from 'react'

import { useLoaderRouteData } from '~/hooks'
import { CloudCheck, Delete, Eye } from '~/icons'

export const NOTE_NAME = 'noteName'

export default function Note() {
  const noteLoaderData = useLoaderRouteData<typeof noteLoader>(
    'routes/notebooks.$notebookId.$noteId'
  )

  if (!noteLoaderData) {
    throw new Error('Note not found')
  }

  const [noteTitle] = useState(noteLoaderData.note.name || '')
  const [savingStatus] = useState<Status>('idle')
  const savingLabel = savingStatus === 'loading' ? 'Saving' : 'Saved'

  return (
    <>
      <div className="header">
        <input
          type="text"
          aria-label="Note title"
          id={NOTE_NAME}
          name={NOTE_NAME}
          value={noteTitle}
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

      <div />
    </>
  )
}
