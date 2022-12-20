import { Link } from '@remix-run/react'

import { Delete, Eye } from '~/icons'

export const NOTE_NAME = 'noteName'

export default function Note() {
  return (
    <>
      <div className="header">
        <input
          type="text"
          aria-label="Note title"
          id={NOTE_NAME}
          name={NOTE_NAME}
          value="fklsdfks"
        />
        <Link to="../view" className="edit-view" prefetch="intent">
          <span>View</span>
          <Eye className="eye" />
        </Link>

        <Link to="../delete" className="delete" prefetch="intent">
          <span>Delete</span>
          <Delete />
        </Link>
      </div>

      <div />
    </>
  )
}
