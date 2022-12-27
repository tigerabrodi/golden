import type { DataFunctionArgs, LinksFunction } from '@remix-run/node'

import { json, redirect } from '@remix-run/node'
import { Outlet, useLoaderData, useParams } from '@remix-run/react'

import { NotebookView } from './notebooks.$notebookId'
import styles from './notebooks.$notebookId.css'

import { getServerFirebase, getUserNotes } from '~/firebase'
import { useGetAllUserNotesSubscription } from '~/hooks'
import { authGetSession } from '~/sessions/auth.server'
import {
  validationCommitSession,
  validationGetSession,
} from '~/sessions/validationStates.server'
import { ACCESS_TOKEN, SET_COOKIE, VALIDATION_STATE_ERROR } from '~/types'
import { getCookie } from '~/utils/getCookie'

export const links: LinksFunction = () => {
  return [{ rel: 'stylesheet', href: styles }]
}

export const loader = async ({ request }: DataFunctionArgs) => {
  const { firebaseAdminAuth } = getServerFirebase()

  const [authSession, validationSession] = await Promise.all([
    authGetSession(getCookie(request)),
    validationGetSession(getCookie(request)),
  ])

  const token = authSession.get(ACCESS_TOKEN)

  try {
    const { uid: ownerId } = await firebaseAdminAuth.verifySessionCookie(token)

    const initialNotes = await getUserNotes(ownerId)

    return json({ initialNotes, ownerId })
  } catch (error) {
    validationSession.flash(
      VALIDATION_STATE_ERROR,
      'You need to be logged in to access this page.'
    )

    return redirect('/', {
      headers: {
        [SET_COOKIE]: await validationCommitSession(validationSession),
      },
    })
  }
}

export default function Notebook() {
  const { initialNotes, ownerId } = useLoaderData<typeof loader>()

  const { noteId } = useParams<{ noteId: string }>()

  const { notes } = useGetAllUserNotesSubscription({
    ownerId,
    initialNotes,
  })

  if (!noteId) {
    throw new Error('Note id is missing in params.')
  }

  return (
    <>
      <NotebookView
        notebookName="All notes"
        notes={notes}
        currentlySelectedNoteId={noteId}
      />
      <Outlet />
    </>
  )
}
