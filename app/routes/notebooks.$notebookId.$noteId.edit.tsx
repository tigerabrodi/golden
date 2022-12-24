import type { loader as noteLoader } from './notebooks.$notebookId.$noteId'
import type { DataFunctionArgs } from '@remix-run/node'
import type { Status } from '~/types'

import { json } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'
import { useState } from 'react'
import { zx } from 'zodix'

import { IS_NEWLY_CREATED } from './notebooks.$notebookId'

import { useLoaderRouteData } from '~/hooks'
import { CloudCheck, Delete, Eye } from '~/icons'

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

  if (!noteLoaderData) {
    throw new Error('Note not found')
  }

  const [noteName] = useState(noteLoaderData.note.name || '')
  const [savingStatus] = useState<Status>('idle')
  const savingLabel = savingStatus === 'loading' ? 'Saving' : 'Saved'

  return (
    <>
      <div className="header">
        <input
          type="text"
          aria-label="Note name"
          id={NOTE_NAME}
          name={NOTE_NAME}
          value={noteName}
          autoFocus={isNewlyCreated}
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
