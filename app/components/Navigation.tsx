import type { loader as rootLoader } from '~/root'

import { Form, Link } from '@remix-run/react'

import { useLoaderRouteData } from '~/hooks'
import { Diamond } from '~/icons'

export function Navigation() {
  const rootLoaderData = useLoaderRouteData<typeof rootLoader>('root')

  return (
    <nav>
      <Link to="/" className="logo" prefetch="intent">
        <Diamond />
        <span>Golden</span>
      </Link>

      {rootLoaderData?.isAuthenticated ? (
        <Form method="post" action="/logout">
          <button type="submit" className="primary">
            Logout
          </button>
        </Form>
      ) : (
        <>
          <Link to="/login" className="login" prefetch="intent">
            Login
          </Link>
          <Link to="/sign-up" className="primary" prefetch="intent">
            Sign up
          </Link>
        </>
      )}
    </nav>
  )
}
