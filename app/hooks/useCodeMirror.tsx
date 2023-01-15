import { markdown, markdownLanguage } from '@codemirror/lang-markdown'
import { languages } from '@codemirror/language-data'
import { EditorState } from '@codemirror/state'
import { oneDark } from '@codemirror/theme-one-dark'
import { vim } from '@replit/codemirror-vim'
import { EditorView, basicSetup } from 'codemirror'
import { useEffect, useMemo, useRef } from 'react'

type Props = {
  content: string
  onChange: (state: EditorState) => void
}

export const useCodeMirror = ({ onChange, content }: Props) => {
  const refContainer = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)
  const contentRef = useRef(content)

  const startState = useMemo(() => {
    return EditorState.create({
      doc: contentRef.current,
      extensions: [
        basicSetup,
        vim(),
        markdown({
          base: markdownLanguage,
          codeLanguages: languages,
          addKeymap: true,
        }),
        oneDark,
        EditorView.lineWrapping,
        EditorView.updateListener.of((update) => {
          const hasContentChanged =
            update.changes.length !== update.changes.newLength
          if (update.changes && hasContentChanged) {
            onChange(update.state)
          }
        }),
      ],
    })
  }, [onChange])

  useEffect(() => {
    if (!refContainer.current || !startState) return

    viewRef.current = new EditorView({
      extensions: [
        // make sure vim is included before other keymaps
        vim(),
        // include the default keymap and all other keymaps you want to use in insert mode
        basicSetup,
      ],
      state: startState,
      parent: refContainer.current,
    })

    return () => {
      viewRef.current?.destroy()
      viewRef.current = null
    }
  }, [startState])

  return { refContainer }
}
