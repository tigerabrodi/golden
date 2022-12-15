import type { DataFunctionArgs } from '@remix-run/node'

import { redirect } from '@remix-run/node'

import { authDestroySession, authGetSession } from '~/sessions/auth.server'
import {
  validationCommitSession,
  validationGetSession,
} from '~/sessions/validationStates.server'
import { SET_COOKIE, VALIDATION_STATE_SUCCESS } from '~/types'
import { getCookie } from '~/utils/getCookie'

export const action = async ({ request }: DataFunctionArgs) => {
  const [authSession, validationSession] = await Promise.all([
    authGetSession(getCookie(request)),
    validationGetSession(getCookie(request)),
  ])

  validationSession.flash(VALIDATION_STATE_SUCCESS, 'Successfully logged out.')

  const [newAuthCookie, validationCommitedSession] = await Promise.all([
    authDestroySession(authSession),
    validationCommitSession(validationSession),
  ])

  return redirect('/', {
    headers: [
      [SET_COOKIE, newAuthCookie],
      [SET_COOKIE, validationCommitedSession],
    ],
  })
}
