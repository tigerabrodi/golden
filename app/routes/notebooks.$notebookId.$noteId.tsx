import type { DataFunctionArgs, LinksFunction } from '@remix-run/node'

import { json, redirect } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'
import { z } from 'zod'
import { zx } from 'zodix'

import styles from './notebooks.$notebookId.$noteId.css'

import { getNote, getServerFirebase } from '~/firebase'
import { Delete, EditPen } from '~/icons'
import { authGetSession } from '~/sessions/auth.server'
import {
  validationCommitSession,
  validationGetSession,
} from '~/sessions/validationStates.server'
import {
  ACCESS_TOKEN,
  ALL_NOTES,
  NOTEBOOKS,
  NOT_LOGGED_IN_ERROR_MESSAGE,
  SET_COOKIE,
  VALIDATION_STATE_ERROR,
} from '~/types'
import { getCookie } from '~/utils/getCookie'

export const links: LinksFunction = () => {
  return [{ rel: 'stylesheet', href: styles }]
}

export const loader = async ({ params, request }: DataFunctionArgs) => {
  const { firebaseAdminAuth } = getServerFirebase()

  const { noteId, notebookId } = zx.parseParams(
    params,
    z.object({ noteId: z.string(), notebookId: z.string() })
  )

  const [authSession, validationSession] = await Promise.all([
    authGetSession(getCookie(request)),
    validationGetSession(getCookie(request)),
  ])

  const token = authSession.get(ACCESS_TOKEN)

  try {
    const { uid: ownerId } = await firebaseAdminAuth.verifySessionCookie(token)

    const note = await getNote({ notebookId, noteId })

    if (!note) {
      validationSession.flash(
        VALIDATION_STATE_ERROR,
        'This note does not exist.'
      )
      return redirect(`/${NOTEBOOKS}/${notebookId}`, {
        headers: {
          [SET_COOKIE]: await validationCommitSession(validationSession),
        },
      })
    }

    const isNotOwnerOfNote = note.ownerId !== ownerId

    if (isNotOwnerOfNote) {
      validationSession.flash(
        VALIDATION_STATE_ERROR,
        'You do not own this note.'
      )
      return redirect(`/${NOTEBOOKS}/${ALL_NOTES}`, {
        headers: {
          [SET_COOKIE]: await validationCommitSession(validationSession),
        },
      })
    }

    return json({ note })
  } catch (error) {
    validationSession.flash(VALIDATION_STATE_ERROR, NOT_LOGGED_IN_ERROR_MESSAGE)

    return redirect('/', {
      headers: {
        [SET_COOKIE]: await validationCommitSession(validationSession),
      },
    })
  }
}

export default function Note() {
  const { note } = useLoaderData<typeof loader>()

  return (
    <div className="note">
      <div className="header">
        <h2>{note.name}</h2>
        <Link to="./edit" className="edit" prefetch="intent">
          <span>Edit</span>
          <EditPen />
        </Link>

        <Link to="./delete" className="delete" prefetch="intent">
          <span>Delete</span>
          <Delete />
        </Link>
      </div>

      <div />
    </div>
  )
}