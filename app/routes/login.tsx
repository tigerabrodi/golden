import type { DataFunctionArgs, LinksFunction } from '@remix-run/node'

import { json, redirect } from '@remix-run/node'
import { Form } from '@remix-run/react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { z } from 'zod'
import { zfd } from 'zod-form-data'

import styles from './auth.css'

import { getServerFirebase } from '~/firebase'
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

export const links: LinksFunction = () => {
  return [{ rel: 'stylesheet', href: styles }]
}

export default function Login() {
  return (
    <main className="auth">
      <h1>Login</h1>
      <p>Fun seeing you’re back!</p>
      <Form method="post">
        <div>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="john@gmail.com"
            required
          />
        </div>

        <div>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            min={6}
            required
          />
        </div>

        <button type="submit">Login</button>
      </Form>
    </main>
  )
}

const FormSchema = zfd.formData(
  z.object({
    [EMAIL]: z.string().email(),
    [PASSWORD]: z.string().min(6),
  })
)

export const action = async ({ request }: DataFunctionArgs) => {
  const { firebaseAuth, firebaseAdminAuth } = getServerFirebase()

  const [formData, validationSession, authSession] = await Promise.all([
    request.formData(),
    validationGetSession(getCookie(request)),
    authGetSession(getCookie(request)),
  ])

  const { email, password } = FormSchema.parse(formData)

  try {
    const { user } = await signInWithEmailAndPassword(
      firebaseAuth,
      email,
      password
    )

    const token = await firebaseAdminAuth.createSessionCookie(
      await user.getIdToken(),
      {
        expiresIn: FIVE_DAYS_IN_MILLISECONDS,
      }
    )

    authSession.set(ACCESS_TOKEN, token)
    validationSession.flash(VALIDATION_STATE_SUCCESS, 'Successfully logged in!')

    const [authCommittedSession, validationCommitedSession] = await Promise.all(
      [
        authCommitSession(authSession),
        validationCommitSession(validationSession),
      ]
    )

    return redirect(`/${NOTEBOOKS}`, {
      headers: [
        [SET_COOKIE, authCommittedSession],
        [SET_COOKIE, validationCommitedSession],
      ],
    })
  } catch (error) {
    validationSession.flash(
      VALIDATION_STATE_ERROR,
      'Invalid email or password.'
    )

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
