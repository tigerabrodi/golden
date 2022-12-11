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
  ]
}

export default function App() {
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}
