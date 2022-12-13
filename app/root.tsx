import type {
  DataFunctionArgs,
  LinksFunction,
  MetaFunction,
  Session,
} from '@remix-run/node'

import RobotoMono500 from '@fontsource/roboto-mono/500.css'
import Roboto400 from '@fontsource/roboto/400.css'
import Roboto500 from '@fontsource/roboto/500.css'
import Roboto700 from '@fontsource/roboto/700.css'
import { json, redirect } from '@remix-run/node'
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from '@remix-run/react'
import { useEffect } from 'react'
import { toast, Toaster } from 'react-hot-toast'
import { z } from 'zod'

import { Navigation, ToastMessage } from './components'
import navigationStyles from './components/Navigation.css'
import toastStyles from './components/ToastMessage.css'
import { getServerFirebase } from './firebase'
import { FirebaseProvider } from './providers'
import styles from './root.css'
import { authGetSession } from './sessions/auth.server'
import {
  validationCommitSession,
  validationGetSession,
} from './sessions/validationStates.server'
import {
  ACCESS_TOKEN,
  ALL_NOTES,
  NOTEBOOKS,
  SET_COOKIE,
  VALIDATION_STATE_ERROR,
  VALIDATION_STATE_SUCCESS,
} from './types'
import { FirebaseOptionsSchema } from './types/firebase'
import { getCookie } from './utils/getCookie'

function getValidationTexts(validationSession: Session) {
  const validationSessionErrorText =
    z
      .string()
      .optional()
      .parse(validationSession.get(VALIDATION_STATE_ERROR)) ?? null
  const validationSessionSuccessText =
    z
      .string()
      .optional()
      .parse(validationSession.get(VALIDATION_STATE_SUCCESS)) ?? null

  return { validationSessionErrorText, validationSessionSuccessText }
}

export const meta: MetaFunction = () => ({
  charset: 'utf-8',
  title: 'Golden',
  viewport: 'width=device-width,initial-scale=1',
})

export const links: LinksFunction = () => {
  return [
    { rel: 'stylesheet', href: Roboto400 },
    { rel: 'stylesheet', href: Roboto500 },
    { rel: 'stylesheet', href: Roboto700 },
    { rel: 'stylesheet', href: RobotoMono500 },
    { rel: 'stylesheet', href: styles },
    { rel: 'stylesheet', href: toastStyles },
    { rel: 'stylesheet', href: navigationStyles },
  ]
}

export const loader = async ({ request }: DataFunctionArgs) => {
  const { firebaseAdminAuth, firebaseDb } = getServerFirebase()

  const options = FirebaseOptionsSchema.parse(firebaseDb.app.options)

  const [validationSession, authSession] = await Promise.all([
    validationGetSession(getCookie(request)),
    authGetSession(getCookie(request)),
  ])

  const validationTextsData = getValidationTexts(validationSession)

  const token = authSession.get(ACCESS_TOKEN)

  const pathname = new URL(request.url).pathname

  const sessionHeaders = {
    headers: {
      [SET_COOKIE]: await validationCommitSession(validationSession),
    },
  }

  try {
    const decodedToken = await firebaseAdminAuth.verifySessionCookie(token)
    const isInsideNoteRoutes = pathname.startsWith(`/${NOTEBOOKS}`)

    const userToken = await firebaseAdminAuth.createCustomToken(
      decodedToken.uid
    )

    if (isInsideNoteRoutes) {
      return json(
        {
          ...validationTextsData,
          isAuthenticated: true,
          firebase: { options, userToken },
        },
        sessionHeaders
      )
    } else {
      return redirect(`/${NOTEBOOKS}/${ALL_NOTES}`, sessionHeaders)
    }
  } catch (error) {
    const isNotOnAuthenticatedPages =
      pathname === '/login' || pathname === '/sign-up' || pathname === '/'
    if (isNotOnAuthenticatedPages) {
      return json(
        { ...validationTextsData, isAuthenticated: false, firebase: null },
        sessionHeaders
      )
    } else {
      return redirect('/', sessionHeaders)
    }
  }
}

export default function App() {
  const loaderData = useLoaderData<typeof loader>()

  const { validationSessionErrorText, validationSessionSuccessText, firebase } =
    loaderData

  useEffect(() => {
    if (validationSessionErrorText) {
      toast((t) => (
        <ToastMessage
          status="error"
          message={validationSessionErrorText}
          removeAlert={() => toast.dismiss(t.id)}
        />
      ))
    }

    if (validationSessionSuccessText) {
      toast((t) => (
        <ToastMessage
          status="success"
          message={validationSessionSuccessText}
          removeAlert={() => toast.dismiss(t.id)}
        />
      ))
    }

    // Necessary to have the `loaderData` here otherwise the effect won't re-run if the validation texts contain the same strings since string is a primitive type
  }, [loaderData, validationSessionErrorText, validationSessionSuccessText])

  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <FirebaseProvider firebase={firebase}>
          <Navigation />
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 2500,
              style: {
                padding: 0,
                backgroundColor: 'transparent',
                maxWidth: 700,
              },
            }}
          />
          <Outlet />
          <ScrollRestoration />
          <Scripts />
          <LiveReload />
        </FirebaseProvider>
      </body>
    </html>
  )
}
