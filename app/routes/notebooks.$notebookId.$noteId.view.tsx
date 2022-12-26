import type { loader as noteLoader } from './notebooks.$notebookId.$noteId'

import { Link } from '@remix-run/react'

import { useLoaderRouteData } from '~/hooks'
import { Delete, EditPen } from '~/icons'
import { NOTEBOOKS } from '~/types'

export default function Note() {
  const noteLoaderData = useLoaderRouteData<typeof noteLoader>(
    'routes/notebooks.$notebookId.$noteId'
  )

  return noteLoaderData ? (
    <>
      <div className="header">
        <h2>{noteLoaderData.initialNote.name}</h2>
        <Link
          to={`/${NOTEBOOKS}/${noteLoaderData.notebookId}/${noteLoaderData.initialNote.id}/edit`}
          className="edit-view"
          prefetch="intent"
        >
          <span>Edit</span>
          <EditPen className="pen" />
        </Link>

        <Link
          to={`/${NOTEBOOKS}/${noteLoaderData.notebookId}/${noteLoaderData.initialNote.id}/view/delete`}
          className="delete"
          prefetch="intent"
        >
          <span>Delete</span>
          <Delete />
        </Link>
      </div>

      <div />
    </>
  ) : null
}
