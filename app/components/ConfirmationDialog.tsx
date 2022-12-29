import { Dialog } from '@headlessui/react'
import { Form, Link, useNavigate } from '@remix-run/react'

import { Close } from '~/icons'
import { BACK_ROUTE } from '~/types'

export function ConfirmationDialog({ title }: { title: string }) {
  const navigate = useNavigate()

  return (
    <>
      <Dialog
        open
        onClose={() => navigate(BACK_ROUTE)}
        className="confirmation-dialog"
      >
        <div className="backdrop" aria-hidden="true" />

        <Dialog.Panel className="panel">
          <Link to={BACK_ROUTE} className="close">
            <Close />
          </Link>

          <Dialog.Title as="h1">{title}</Dialog.Title>

          <Form className="actions" method="post">
            <Link to={BACK_ROUTE}>Cancel</Link>

            <button type="submit">Delete</button>
          </Form>
        </Dialog.Panel>
      </Dialog>
    </>
  )
}
