import type {
  loader as noteLoader,
  NoteOutletContext,
} from './notebooks.$notebookId.$noteId'

import { Link, useOutletContext } from '@remix-run/react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { nord } from 'react-syntax-highlighter/dist/esm/styles/prism'

import { useLoaderRouteData } from '~/hooks'
import { Delete, EditPen } from '~/icons'
import { NOTEBOOKS } from '~/types'

export default function Note() {
  const noteLoaderData = useLoaderRouteData<typeof noteLoader>(
    'routes/notebooks.$notebookId.$noteId'
  )

  const { note } = useOutletContext<NoteOutletContext>()

  return noteLoaderData ? (
    <>
      <div className="header">
        <h2>{note.name}</h2>
        <Link
          to={`/${NOTEBOOKS}/${noteLoaderData.notebookId}/${note.id}/edit`}
          className="edit-view"
          prefetch="intent"
          aria-label="Edit note"
        >
          <span>Edit</span>
          <EditPen className="pen" />
        </Link>

        <Link
          to={`/${NOTEBOOKS}/${noteLoaderData.notebookId}/${note.id}/view/delete`}
          className="delete"
          prefetch="intent"
          aria-label="Delete note"
        >
          <span>Delete</span>
          <Delete />
        </Link>
      </div>

      <div className="markdown">
        <ReactMarkdown
          children={note.content}
          components={{
            code({ node, inline, className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || '')
              return !inline && match ? (
                <SyntaxHighlighter
                  children={String(children).replace(/\n$/, '')}
                  // @ts-ignore
                  style={nord}
                  language={match[1]}
                  PreTag="div"
                  {...props}
                />
              ) : (
                <code className={className} {...props}>
                  {children}
                </code>
              )
            },
          }}
        />
      </div>
    </>
  ) : null
}
