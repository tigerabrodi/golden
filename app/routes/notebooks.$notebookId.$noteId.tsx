import type { DataFunctionArgs, LinksFunction } from '@remix-run/node'
import type { Dispatch, SetStateAction } from 'react'
import type { Note } from '~/types'

import { json, redirect } from '@remix-run/node'
import { Outlet, useLoaderData } from '@remix-run/react'
import { z } from 'zod'
import { zx } from 'zodix'

import styles from './notebooks.$notebookId.$noteId.css'

import { getNote, getServerFirebase } from '~/firebase'
import { useGetNoteSubscription } from '~/hooks'
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

    const initialNote = await getNote({ notebookId, noteId })

    if (!initialNote) {
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

    const isNotOwnerOfNote = initialNote.ownerId !== ownerId

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

    return json({ initialNote, notebookId })
  } catch (error) {
    validationSession.flash(VALIDATION_STATE_ERROR, NOT_LOGGED_IN_ERROR_MESSAGE)

    return redirect('/', {
      headers: {
        [SET_COOKIE]: await validationCommitSession(validationSession),
      },
    })
  }
}

export type NoteOutletContext = {
  note: Note
  setNote: Dispatch<SetStateAction<Note>>
}

export default function NoteRoute() {
  const { initialNote, notebookId } = useLoaderData<typeof loader>()

  const { note, setNote } = useGetNoteSubscription({
    initialNote,
    notebookId,
  })

  const context: NoteOutletContext = { note, setNote }

  return (
    <div className="note">
      <Outlet context={context} />
    </div>
  )
}
