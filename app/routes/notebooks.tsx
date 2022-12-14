import type { LinksFunction } from '@remix-run/node'

import { Link, Outlet } from '@remix-run/react'

import styles from './notebooks.css'

import { Book, Paper, Plus } from '~/icons'
import { ALL_NOTES, NOTEBOOKS } from '~/types'

export const links: LinksFunction = () => {
  return [{ rel: 'stylesheet', href: styles }]
}

export default function Notebooks() {
  return (
    <main>
      <div className="notebooks">
        <Link to={`/${NOTEBOOKS}/${ALL_NOTES}`} className="all-notes-link">
          <Paper />
          <span>All notes</span>
        </Link>

        <div className="notebooks-list">
          <div>
            <Book />
            <p>Notebooks</p>
            <Link to={`/${NOTEBOOKS}/add`}>
              <Plus />
            </Link>
          </div>
          <ul>
            <li>
              <Link to={`/${NOTEBOOKS}/notebook-1`}>General notes</Link>
            </li>
          </ul>
        </div>
      </div>
      <Outlet />
    </main>
  )
}
