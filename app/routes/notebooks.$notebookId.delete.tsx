import type { DataFunctionArgs, LinksFunction } from '@remix-run/node'

import { redirect } from '@remix-run/node'
import { z } from 'zod'
import { zx } from 'zodix'

import { ConfirmationDialog } from '~/components'
import ConfirmationDialogStyles from '~/components/ConfirmationDialog.css'
import DialogStyles from '~/components/Dialog.css'
import { deleteNotebook, getNotebook, getServerFirebase } from '~/firebase'
import { authGetSession } from '~/sessions/auth.server'
import {
  validationCommitSession,
  validationGetSession,
} from '~/sessions/validationStates.server'
import {
  ACCESS_TOKEN,
  NOTEBOOKS,
  NOT_LOGGED_IN_ERROR_MESSAGE,
  SET_COOKIE,
  VALIDATION_STATE_ERROR,
} from '~/types'
import { getCookie } from '~/utils/getCookie'

export const links: LinksFunction = () => {
  return [
    { rel: 'stylesheet', href: DialogStyles },
    { rel: 'stylesheet', href: ConfirmationDialogStyles },
  ]
}

export default function DeleteNote() {
  return (
    <ConfirmationDialog title="Are you sure you want to delete your notebook?" />
  )
}

export const action = async ({ params, request }: DataFunctionArgs) => {
  const { firebaseAdminAuth } = getServerFirebase()

  const { notebookId } = zx.parseParams(
    params,
    z.object({
      notebookId: z.string(),
    })
  )

  const [authSession, validationSession] = await Promise.all([
    authGetSession(getCookie(request)),
    validationGetSession(getCookie(request)),
  ])

  const token = authSession.get(ACCESS_TOKEN)

  try {
    const [{ uid: ownerId }, note] = await Promise.all([
      firebaseAdminAuth.verifySessionCookie(token),
      getNotebook(notebookId),
    ])

    const isOwner = note?.ownerId === ownerId

    if (!isOwner) {
      validationSession.flash(
        VALIDATION_STATE_ERROR,
        "You don't have permission to delete this notebook."
      )

      return redirect(`/${NOTEBOOKS}`, {
        headers: {
          [SET_COOKIE]: await validationCommitSession(validationSession),
        },
      })
    }

    await deleteNotebook(notebookId)

    validationSession.flash(
      VALIDATION_STATE_ERROR,
      'Successfully deleted notebook!'
    )

    return redirect(`/${NOTEBOOKS}`, {
      headers: {
        [SET_COOKIE]: await validationCommitSession(validationSession),
      },
    })
  } catch (error) {
    validationSession.flash(VALIDATION_STATE_ERROR, NOT_LOGGED_IN_ERROR_MESSAGE)

    return redirect('/', {
      headers: {
        [SET_COOKIE]: await validationCommitSession(validationSession),
      },
    })
  }
}
