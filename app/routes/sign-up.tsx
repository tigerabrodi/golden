import type { DataFunctionArgs, LinksFunction } from '@remix-run/node'
import type { FirebaseError } from 'firebase/app'

import { redirect } from '@remix-run/node'
import { json } from '@remix-run/node'
import { Form, useTransition } from '@remix-run/react'
import { AuthErrorCodes, createUserWithEmailAndPassword } from 'firebase/auth'
import { z } from 'zod'
import { zfd } from 'zod-form-data'

import styles from './auth.css'

import { createFirstGeneralNotebook, getServerFirebase } from '~/firebase'
import { authCommitSession, authGetSession } from '~/sessions/auth.server'
import {
  validationCommitSession,
  validationGetSession,
} from '~/sessions/validationStates.server'
import {
  ACCESS_TOKEN,
  EMAIL,
  FIVE_DAYS_IN_MILLISECONDS,
  NOTEBOOKS,
  PASSWORD,
  SET_COOKIE,
  VALIDATION_STATE_ERROR,
  VALIDATION_STATE_SUCCESS,
} from '~/types'
import { getCookie } from '~/utils/getCookie'

const CONFIRM_PASSWORD = 'confirmPassword'

export const links: LinksFunction = () => {
  return [{ rel: 'stylesheet', href: styles }]
}

export default function SignUp() {
  const transition = useTransition()

  const isSubmitting = transition.state === 'submitting'

  const buttonText = isSubmitting ? 'Signing up...' : 'Sign up'

  return (
    <main className="auth">
      <h1>Sign up</h1>
      <p>Welcome, setup your account and start organizing your notes!</p>
      <Form method="post">
        <div>
          <label htmlFor={EMAIL}>Email</label>
          <input
            type="email"
            id={EMAIL}
            name={EMAIL}
            placeholder="john@gmail.com"
            required
          />
        </div>

        <div>
          <label htmlFor={PASSWORD}>Password</label>
          <input
            type="password"
            id={PASSWORD}
            name={PASSWORD}
            min={6}
            required
          />
        </div>

        <div>
          <label htmlFor={CONFIRM_PASSWORD}>Confirm password</label>
          <input
            type="password"
            id={CONFIRM_PASSWORD}
            name={CONFIRM_PASSWORD}
            min={6}
            required
          />
        </div>

        <button type="submit" disabled={isSubmitting}>
          {buttonText}
        </button>
      </Form>
    </main>
  )
}

const FormSchema = zfd.formData(
  z.object({
    [EMAIL]: z.string().email(),
    [PASSWORD]: z.string().min(6),
    [CONFIRM_PASSWORD]: z.string().min(6),
  })
)

export const action = async ({ request }: DataFunctionArgs) => {
  const { firebaseAuth, firebaseAdminAuth } = getServerFirebase()

  const [formData, validationSession, authSession] = await Promise.all([
    request.formData(),
    validationGetSession(getCookie(request)),
    authGetSession(getCookie(request)),
  ])

  const { email, password, confirmPassword } = FormSchema.parse(formData)

  if (password !== confirmPassword) {
    validationSession.flash(VALIDATION_STATE_ERROR, "Passwords don't match.")

    return json(
      {},
      {
        status: 400,
        headers: {
          [SET_COOKIE]: await validationCommitSession(validationSession),
        },
      }
    )
  }

  try {
    const { user } = await createUserWithEmailAndPassword(
      firebaseAuth,
      email,
      password
    )

    const createCookiePromise = firebaseAdminAuth.createSessionCookie(
      await user.getIdToken(),
      {
        expiresIn: FIVE_DAYS_IN_MILLISECONDS,
      }
    )

    const [token, generalNotebookId] = await Promise.all([
      createCookiePromise,
      createFirstGeneralNotebook(user.uid),
    ])

    authSession.set(ACCESS_TOKEN, token)
    validationSession.flash(VALIDATION_STATE_SUCCESS, 'Successfully signed up!')

    const [authCommittedSession, validationCommitedSession] = await Promise.all(
      [
        authCommitSession(authSession),
        validationCommitSession(validationSession),
      ]
    )

    return redirect(`/${NOTEBOOKS}/${generalNotebookId}`, {
      headers: [
        [SET_COOKIE, authCommittedSession],
        [SET_COOKIE, validationCommitedSession],
      ],
    })
  } catch (error) {
    const firebaseError = error as FirebaseError
    const isEmailAlreadyInUse =
      firebaseError.code === AuthErrorCodes.EMAIL_EXISTS

    const errorMessage = isEmailAlreadyInUse
      ? 'User with this email already exists.'
      : 'Something went wrong, please try again.'

    validationSession.flash(VALIDATION_STATE_ERROR, errorMessage)

    return json(
      {},
      {
        headers: {
          [SET_COOKIE]: await validationCommitSession(validationSession),
        },
      }
    )
  }
}
