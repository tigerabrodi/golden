import type { EditorState } from '@codemirror/state'

import { useCallback } from 'react'

import { useCodeMirror } from '~/hooks'

type Props = {
  content: string
  onChange: (content: string) => void
}

export const Editor = ({ onChange, content }: Props) => {
  const handleChange = useCallback(
    (state: EditorState) => {
      onChange(state.doc.toString())
    },
    [onChange]
  )

  const { refContainer } = useCodeMirror({
    content: content,
    onChange: handleChange,
  })

  return <div className="editor-wrapper scroll-bar" ref={refContainer} />
}
