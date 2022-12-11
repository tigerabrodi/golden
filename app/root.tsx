import type { LinksFunction, MetaFunction } from '@remix-run/node'

import RobotoMono500 from '@fontsource/roboto-mono/500.css'
import Roboto400 from '@fontsource/roboto/400.css'
import Roboto500 from '@fontsource/roboto/500.css'
import Roboto700 from '@fontsource/roboto/700.css'
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from '@remix-run/react'
import { useEffect } from 'react'
import { toast, Toaster } from 'react-hot-toast'

import { ToastMessage } from './components'
import toastStyles from './components/ToastMessage.css'
import styles from './root.css'

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
  ]
}

export default function App() {
  useEffect(() => {
    toast((t) => (
      <ToastMessage
        status="error"
        message="Successfully logged in."
        removeAlert={() => toast.dismiss(t.id)}
      />
    ))

    // Necessary to have the `loaderData` here otherwise the effect won't re-run if the validation texts contain the same strings since string is a primitive type
  }, [])

  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 2500,
            style: { padding: 0, backgroundColor: 'transparent' },
          }}
        />
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}
