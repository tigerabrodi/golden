import type { DataFunctionArgs, LinksFunction } from '@remix-run/node'

import { redirect } from '@remix-run/node'
import { Form, Link } from '@remix-run/react'
import { z } from 'zod'
import { zfd } from 'zod-form-data'

import AddDialogStyles from './notebooks.add.css'

import { Dialog } from '~/components'
import DialogStyles from '~/components/Dialog.css'
import { createNotebook, getServerFirebase } from '~/firebase'
import { authGetSession } from '~/sessions/auth.server'
import {
  validationCommitSession,
  validationGetSession,
} from '~/sessions/validationStates.server'
import {
  ACCESS_TOKEN,
  BACK_ROUTE,
  NOT_LOGGED_IN_ERROR_MESSAGE,
  SET_COOKIE,
  VALIDATION_STATE_ERROR,
  VALIDATION_STATE_SUCCESS,
} from '~/types'
import { getCookie } from '~/utils/getCookie'

export const links: LinksFunction = () => {
  return [
    { rel: 'stylesheet', href: DialogStyles },
    { rel: 'stylesheet', href: AddDialogStyles },
  ]
}

export default function NotebooksAdd() {
  return (
    <Dialog title="Add a new notebook">
      <Form method="post">
        <label htmlFor="name">Enter notebook name</label>
        <input
          type="text"
          name="name"
          id="name"
          placeholder="General notes"
          required
        />

        <div>
          <Link to={BACK_ROUTE}>Cancel</Link>

          <button type="submit">Create</button>
        </div>
      </Form>
    </Dialog>
  )
}

const AddFormSchema = zfd.formData(
  z.object({
    name: z.string(),
  })
)

export const action = async ({ request }: DataFunctionArgs) => {
  const { firebaseAdminAuth } = getServerFirebase()

  const [authSession, validationSession, formData] = await Promise.all([
    authGetSession(getCookie(request)),
    validationGetSession(getCookie(request)),
    request.formData(),
  ])

  const { name } = AddFormSchema.parse(formData)

  const token = authSession.get(ACCESS_TOKEN)

  try {
    const { uid: ownerId } = await firebaseAdminAuth.verifySessionCookie(token)

    const notebookId = await createNotebook({ ownerId, name })

    validationSession.flash(
      VALIDATION_STATE_SUCCESS,
      'Successfully created notebook!'
    )

    return redirect(`${BACK_ROUTE}/${notebookId}`, {
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
