import { Form, Link } from '@remix-run/react'

import { Dialog } from './Dialog'

import { BACK_ROUTE } from '~/types'

export function ConfirmationDialog({ title }: { title: string }) {
  return (
    <Dialog title={title}>
      <Form method="post">
        <Link to={BACK_ROUTE}>Cancel</Link>

        <button type="submit">Delete</button>
      </Form>
    </Dialog>
  )
}
