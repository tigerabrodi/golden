import type { LinksFunction } from '@remix-run/node'

import styles from './index.css'

export const links: LinksFunction = () => {
  return [{ rel: 'stylesheet', href: styles }]
}

export default function Index() {
  return <div>hello world</div>
}
