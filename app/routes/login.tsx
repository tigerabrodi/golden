import type { LinksFunction } from '@remix-run/node'

import styles from './auth.css'

export const links: LinksFunction = () => {
  return [{ rel: 'stylesheet', href: styles }]
}

export default function Login() {
  return (
    <main className="auth">
      <h1>Login</h1>
      <p>Fun seeing you’re back!</p>
      <form>
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
      </form>
    </main>
  )
}
