import type { ReactNode } from 'react'

import { Dialog as HeadlessDialog } from '@headlessui/react'
import { Link, useNavigate } from '@remix-run/react'

import { Close } from '~/icons'
import { BACK_ROUTE } from '~/types'

export function Dialog({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  const navigate = useNavigate()

  return (
    <>
      <HeadlessDialog
        open
        onClose={() => navigate(BACK_ROUTE)}
        className="dialog"
      >
        <div className="backdrop" aria-hidden="true" />

        <HeadlessDialog.Panel className="panel">
          <Link to={BACK_ROUTE} className="close">
            <Close />
          </Link>

          <HeadlessDialog.Title as="h1">{title}</HeadlessDialog.Title>

          {children}
        </HeadlessDialog.Panel>
      </HeadlessDialog>
    </>
  )
}
