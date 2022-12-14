import type { LinksFunction } from '@remix-run/node'

import { Form, Link, Outlet } from '@remix-run/react'

import styles from './notebooks.$notebookId.css'

import { AddPen, Delete, PenWithPaper } from '~/icons'

export const links: LinksFunction = () => {
  return [{ rel: 'stylesheet', href: styles }]
}

export default function Notebook() {
  return (
    <>
      <div className="notes">
        <div className="header">
          <h1>General notes</h1>
          <Form method="post">
            <button type="submit">
              <AddPen />
            </button>
          </Form>

          <Link to="/">
            <Delete />
          </Link>
        </div>

        <div className="content">
          <div>
            <PenWithPaper />
            <h2>No notes.</h2>
          </div>
        </div>
      </div>
      <Outlet />
    </>
  )
}
