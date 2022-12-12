import type { LinksFunction } from '@remix-run/node'

import styles from './index.css'

export const links: LinksFunction = () => {
  return [{ rel: 'stylesheet', href: styles }]
}

export default function Index() {
  return (
    <main className="home">
      <h1>Golden let’s you take notes in Mardown effortlessy</h1>
      <h2>
        Meet the simplistic way of taking and organizing notes in Markdown.
      </h2>
      <div />
    </main>
  )
}
