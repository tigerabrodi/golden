import type { DataFunctionArgs, LinksFunction } from '@remix-run/node'
import type { Status } from '~/types'

import { json, redirect } from '@remix-run/node'
import {
  Link,
  Outlet,
  useLoaderData,
  useLocation,
  useTransition,
} from '@remix-run/react'
import { doc, updateDoc } from 'firebase/firestore'
import markdownStyles from 'github-markdown-css/github-markdown-dark.css'
import debounce from 'lodash.debounce'
import { useCallback, useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { nord } from 'react-syntax-highlighter/dist/esm/styles/prism'
import remarkGfm from 'remark-gfm'
import { z } from 'zod'
import { zx } from 'zodix'

import { IS_NEWLY_CREATED } from './notebooks.$notebookId'
import styles from './notebooks.$notebookId.$noteId.css'

import { Editor } from '~/components'
import {
  getNote,
  getServerFirebase,
  NOTEBOOKS_COLLECTION,
  NOTES_COLLECTION,
} from '~/firebase'
import { useGetNoteSubscription } from '~/hooks'
import { CloudCheck, Delete, EditPen, Eye } from '~/icons'
import { useFirebase } from '~/providers'
import { authGetSession } from '~/sessions/auth.server'
import {
  validationCommitSession,
  validationGetSession,
} from '~/sessions/validationStates.server'
import {
  ACCESS_TOKEN,
  NOTEBOOKS,
  NOT_LOGGED_IN_ERROR_MESSAGE,
  SET_COOKIE,
  VALIDATION_STATE_ERROR,
} from '~/types'
import { getCookie } from '~/utils/getCookie'

export const NOTE_NAME = 'noteName'

export const links: LinksFunction = () => {
  return [
    { rel: 'stylesheet', href: styles },
    { rel: 'stylesheet', href: markdownStyles },
  ]
}

export const loader = async ({ params, request }: DataFunctionArgs) => {
  const { firebaseAdminAuth } = getServerFirebase()

  const { noteId, notebookId } = zx.parseParams(
    params,
    z.object({ noteId: z.string(), notebookId: z.string() })
  )

  const { isNewlyCreated } = zx.parseQuery(request, {
    [IS_NEWLY_CREATED]: zx.BoolAsString.optional(),
  })

  const [authSession, validationSession] = await Promise.all([
    authGetSession(getCookie(request)),
    validationGetSession(getCookie(request)),
  ])

  const token = authSession.get(ACCESS_TOKEN)

  try {
    const [{ uid: ownerId }, initialNote] = await Promise.all([
      firebaseAdminAuth.verifySessionCookie(token),
      getNote({ notebookId, noteId }),
    ])

    if (!initialNote) {
      validationSession.flash(
        VALIDATION_STATE_ERROR,
        'This note does not exist.'
      )
      return redirect(`/${NOTEBOOKS}/${notebookId}`, {
        headers: {
          [SET_COOKIE]: await validationCommitSession(validationSession),
        },
      })
    }

    const isNotOwnerOfNote = initialNote.ownerId !== ownerId

    if (isNotOwnerOfNote) {
      validationSession.flash(
        VALIDATION_STATE_ERROR,
        'You do not own this note.'
      )
      return redirect(`/${NOTEBOOKS}`, {
        headers: {
          [SET_COOKIE]: await validationCommitSession(validationSession),
        },
      })
    }

    return json({
      initialNote,
      notebookId,
      isNewlyCreated,
    })
  } catch (error) {
    validationSession.flash(VALIDATION_STATE_ERROR, NOT_LOGGED_IN_ERROR_MESSAGE)

    return redirect('/', {
      headers: {
        [SET_COOKIE]: await validationCommitSession(validationSession),
      },
    })
  }
}

export type State = 'view' | 'edit'

export default function NoteRoute() {
  const location = useLocation()

  return <NoteRouteComp key={location.key} />
}

function NoteRouteComp() {
  const { initialNote, notebookId, isNewlyCreated } =
    useLoaderData<typeof loader>()

  const { note, setNote } = useGetNoteSubscription({
    initialNote,
    notebookId,
  })

  const transition = useTransition()
  const firebaseContext = useFirebase()

  const [savingNameStatus, setSavingNameStatus] = useState<Status>('idle')
  const [savingContentStatus, setSavingContentStatus] = useState<Status>('idle')
  const [state, setState] = useState<State>(isNewlyCreated ? 'edit' : 'view')

  const isSaving =
    savingNameStatus === 'loading' || savingContentStatus === 'loading'
  const savingLabel = isSaving ? 'Saving' : 'Saved'

  // useCallback is required for debounce to work
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleNoteNameChange = useCallback(
    debounce(async (noteName: string) => {
      if (firebaseContext?.firebaseDb) {
        setSavingNameStatus('loading')
        const noteDoc = doc(
          firebaseContext.firebaseDb,
          // Using initial id here because note.id could be stale
          `/${NOTEBOOKS_COLLECTION}/${notebookId}/${NOTES_COLLECTION}/${initialNote.id}`
        )
        await updateDoc(noteDoc, { name: noteName })
        setSavingNameStatus('success')
      }
    }, 500),
    [firebaseContext]
  )

  // useCallback is required for debounce to work
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleNoteContentChange = useCallback(
    debounce(async (noteContent: string) => {
      if (firebaseContext?.firebaseDb) {
        setSavingContentStatus('loading')
        const noteDoc = doc(
          firebaseContext.firebaseDb,
          // Using initial id here because note.id could be stale
          `/${NOTEBOOKS_COLLECTION}/${notebookId}/${NOTES_COLLECTION}/${initialNote.id}`
        )
        await updateDoc(noteDoc, { content: noteContent })
        setSavingContentStatus('success')
      }
    }, 500),
    [firebaseContext]
  )

  const isNavigatingToAnotherNote = transition.state === 'loading'
  const isSubscribedNoteStale = note.id !== initialNote.id
  const isNoteNameTheSame = initialNote.name === note.name
  const isNoteContentTheSame = initialNote.content === note.content

  const shouldNotUpdateNoteName =
    isNavigatingToAnotherNote ||
    isNoteNameTheSame ||
    isSubscribedNoteStale ||
    state === 'view'

  const shouldNotUpdateNoteContent =
    isNavigatingToAnotherNote ||
    isNoteContentTheSame ||
    isSubscribedNoteStale ||
    state === 'view'

  useEffect(() => {
    if (shouldNotUpdateNoteName) {
      return
    }

    handleNoteNameChange(note.name)?.catch((error) => {
      console.error(error)
      setSavingNameStatus('error')
    })
  }, [note.name, shouldNotUpdateNoteName, handleNoteNameChange])

  useEffect(() => {
    if (shouldNotUpdateNoteContent) {
      return
    }

    handleNoteContentChange(note.content)?.catch((error) => {
      console.error(error)
      setSavingContentStatus('error')
    })
  }, [note.content, shouldNotUpdateNoteContent, handleNoteContentChange])

  const handleContentChange = useCallback(
    (content: string) => {
      setNote((prevNote) => ({
        ...prevNote,
        content,
      }))
    },
    [setNote]
  )

  return (
    <div className="note">
      {state === 'view' ? (
        <div className="header">
          <h2>{note.name}</h2>
          <button
            className="edit-view"
            aria-label="Edit note"
            type="button"
            onClick={() => setState('edit')}
          >
            <span>Edit</span>
            <EditPen className="pen" />
          </button>

          <Link
            to="./delete"
            className="delete"
            prefetch="intent"
            aria-label="Delete note"
          >
            <span>Delete</span>
            <Delete />
          </Link>
        </div>
      ) : (
        <div className="header">
          <input
            type="text"
            aria-label="Note name"
            id={NOTE_NAME}
            name={NOTE_NAME}
            autoFocus={isNewlyCreated}
            value={note.name}
            onChange={(event) =>
              setNote((prevNote) => ({
                ...prevNote,
                name: event.target.value,
              }))
            }
          />
          <button
            className="edit-view"
            aria-label="View note"
            type="button"
            onClick={() => setState('view')}
          >
            <span>View</span>
            <Eye className="eye" />
          </button>

          <div className="status" role="status" aria-label={savingLabel}>
            <CloudCheck />
            <span>{savingLabel}</span>
          </div>

          <Link
            to="./delete"
            className="delete"
            prefetch="intent"
            aria-label="Delete note"
          >
            <span>Delete</span>
            <Delete />
          </Link>
        </div>
      )}

      {state === 'view' ? (
        <div
          className="preview markdown-body scroll-bar"
          style={{ padding: note.content === '' ? 0 : '10px' }}
        >
          <ReactMarkdown
            children={note.content}
            remarkPlugins={[remarkGfm]}
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
      ) : (
        <Editor
          onChange={handleContentChange}
          content={note.content}
          isNoteNewlyCreated={Boolean(isNewlyCreated)}
        />
      )}

      <Outlet />
    </div>
  )
}
