import { Link } from '@remix-run/react'

import { Diamond } from '~/icons'

export function Navigation() {
  return (
    <nav>
      <Link to="/" className="logo">
        <Diamond />
        <span>Golden</span>
      </Link>

      <Link to="/login" className="login">
        Login
      </Link>
      <Link to="/sign-up" className="primary">
        Sign up
      </Link>
    </nav>
  )
}
