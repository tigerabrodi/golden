import type { DataFunctionArgs, LinksFunction } from '@remix-run/node'

import { json } from '@remix-run/node'
import { redirect } from '@remix-run/node'
import { Link, Outlet, useLoaderData } from '@remix-run/react'

import styles from './notebooks.css'

import { getServerFirebase } from '~/firebase'
import { getUserNotebooks } from '~/firebase/read.server'
import { Book, Paper, Plus } from '~/icons'
import { authGetSession } from '~/sessions/auth.server'
import {
  validationCommitSession,
  validationGetSession,
} from '~/sessions/validationStates.server'
import {
  ACCESS_TOKEN,
  ALL_NOTES_ROUTE,
  NOTEBOOKS,
  SET_COOKIE,
  VALIDATION_STATE_ERROR,
} from '~/types'
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
    const notebooks = await getUserNotebooks(ownerId)
    return json({ notebooks })
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

export default function Notebooks() {
  const { notebooks } = useLoaderData<typeof loader>()

  return (
    <main>
      <div className="notebooks">
        <Link
          to={`/${NOTEBOOKS}/${ALL_NOTES_ROUTE}`}
          className="all-notes-link"
          prefetch="intent"
        >
          <Paper />
          <span>All notes</span>
        </Link>

        <div className="notebooks-list">
          <div>
            <Book />
            <p>Notebooks</p>
            <Link to={`/${NOTEBOOKS}/add`} prefetch="intent">
              <Plus />
            </Link>
          </div>
          {notebooks.length > 0 && (
            <ul>
              {notebooks.map(({ id, name }) => (
                <li key={id}>
                  <Link to={`/${NOTEBOOKS}/${id}`} prefetch="intent">
                    {name}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <Outlet />
    </main>
  )
}
