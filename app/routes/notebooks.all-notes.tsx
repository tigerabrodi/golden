import type { DataFunctionArgs, LinksFunction } from '@remix-run/node'

import { json, redirect } from '@remix-run/node'
import { Form, Link, Outlet, useLoaderData } from '@remix-run/react'

import styles from './notebooks.$notebookId.css'

import { getServerFirebase, getUserNotes } from '~/firebase'
import { AddPen, Delete, PenWithPaper } from '~/icons'
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

    const notes = await getUserNotes(ownerId)

    return json({ notes })
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
  const { notes } = useLoaderData<typeof loader>()

  return (
    <>
      <div className="notes">
        <div className="header">
          <h1>All notes</h1>
          <Form method="post">
            <button type="submit">
              <AddPen />
            </button>
          </Form>

          <Link to="/" prefetch="intent">
            <Delete />
          </Link>
        </div>

        <div className="content">
          {notes.length > 0 ? (
            <div />
          ) : (
            <div>
              <PenWithPaper />
              <h2>No notes.</h2>
            </div>
          )}
        </div>
      </div>
      <Outlet />
    </>
  )
}
