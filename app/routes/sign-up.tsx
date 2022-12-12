import type { ActionFunction, LinksFunction } from '@remix-run/node'

import { json } from '@remix-run/node'
import { Form } from '@remix-run/react'
import { z } from 'zod'
import { zfd } from 'zod-form-data'

import styles from './auth.css'

import {
  validationCommitSession,
  validationGetSession,
} from '~/sessions/validationStates.server'
import { SET_COOKIE, VALIDATION_STATE_ERROR } from '~/types'
import { getCookie } from '~/utils/getCookie'

const EMAIL = 'email'
const PASSWORD = 'password'
const CONFIRM_PASSWORD = 'confirmPassword'

export const links: LinksFunction = () => {
  return [{ rel: 'stylesheet', href: styles }]
}

export default function SignUp() {
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

        <button type="submit">Sign up</button>
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

export const action: ActionFunction = async ({ request }) => {
  const [formData, validationSession] = await Promise.all([
    request.formData(),
    validationGetSession(getCookie(request)),
  ])

  const { password, confirmPassword } = FormSchema.parse(formData)

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

  return null
}
