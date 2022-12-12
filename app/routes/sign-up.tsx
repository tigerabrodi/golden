import type { LinksFunction } from '@remix-run/node'

import styles from './auth.css'

export const links: LinksFunction = () => {
  return [{ rel: 'stylesheet', href: styles }]
}

export default function SignUp() {
  return (
    <main className="auth">
      <h1>Sign up</h1>
      <p>Welcome, setup your account and start organizing your notes!</p>
      <form>
        <div>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="john@gmail.com"
          />
        </div>

        <div>
          <label htmlFor="password">Password</label>
          <input type="password" id="password" name="password" />
        </div>

        <div>
          <label htmlFor="confirmPassword">Confirm password</label>
          <input type="password" id="confirmPassword" name="confirmPassword" />
        </div>

        <button type="submit">Sign up</button>
      </form>
    </main>
  )
}
