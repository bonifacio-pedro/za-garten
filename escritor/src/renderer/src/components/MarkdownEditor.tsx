import { useEffect, useRef, useState } from 'react'
import { EditorState } from '@codemirror/state'
import { EditorView, keymap, placeholder } from '@codemirror/view'
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands'
import { markdown } from '@codemirror/lang-markdown'
import { wrapSelection, prefixLines } from '../lib/mdFormat'
import FormatBubble from './FormatBubble'

interface Props {
  value: string
  onChange: (value: string) => void
}

interface BubbleState {
  top: number
  left: number
  visible: boolean
}

export default function MarkdownEditor({ value, onChange }: Props): React.JSX.Element {
  const hostRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange
  const [bubble, setBubble] = useState<BubbleState>({ top: 0, left: 0, visible: false })

  useEffect(() => {
    if (!hostRef.current) return

    const updateBubble = (view: EditorView): void => {
      const sel = view.state.selection.main
      if (sel.empty) {
        setBubble((b) => (b.visible ? { ...b, visible: false } : b))
        return
      }
      const start = view.coordsAtPos(sel.from)
      const end = view.coordsAtPos(sel.to)
      const host = hostRef.current?.getBoundingClientRect()
      if (!start || !end || !host) return
      const top = Math.min(start.top, end.top) - host.top - 42
      const left = (Math.min(start.left, end.left) + Math.max(start.right, end.right)) / 2 - host.left
      setBubble({ top: Math.max(4, top), left, visible: true })
    }

    const state = EditorState.create({
      doc: value,
      extensions: [
        history(),
        markdown(),
        placeholder('Escreva o Markdown do post…'),
        keymap.of([...defaultKeymap, ...historyKeymap, indentWithTab]),
        EditorView.lineWrapping,
        EditorView.updateListener.of((u) => {
          if (u.docChanged) {
            onChangeRef.current(u.state.doc.toString())
          }
          if (u.selectionSet || u.docChanged || u.geometryChanged) {
            updateBubble(u.view)
          }
        }),
        EditorView.theme({
          '&': { height: '100%', backgroundColor: 'transparent' },
          '.cm-content': { padding: '12px 14px', caretColor: '#2f5d3a' },
          '.cm-gutters': { display: 'none' },
          '&.cm-focused': { outline: 'none' }
        })
      ]
    })

    const view = new EditorView({ state, parent: hostRef.current })
    viewRef.current = view

    return () => {
      view.destroy()
      viewRef.current = null
    }
    // mount once; sync value via separate effect
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const view = viewRef.current
    if (!view) return
    const current = view.state.doc.toString()
    if (current !== value) {
      view.dispatch({
        changes: { from: 0, to: current.length, insert: value }
      })
    }
  }, [value])

  const apply = (fn: (view: EditorView) => void): void => {
    const view = viewRef.current
    if (!view) return
    fn(view)
    view.focus()
  }

  return (
    <div className="cm-wrap" ref={hostRef}>
      {bubble.visible && (
        <FormatBubble
          top={bubble.top}
          left={bubble.left}
          onBold={() => apply((v) => wrapSelection(v, '**', '**'))}
          onItalic={() => apply((v) => wrapSelection(v, '*', '*'))}
          onCode={() => apply((v) => wrapSelection(v, '`', '`'))}
          onLink={() =>
            apply((v) => {
              const url = prompt('URL do link:', 'https://')
              if (!url) return
              wrapSelection(v, '[', `](${url})`)
            })
          }
          onH2={() => apply((v) => prefixLines(v, '## '))}
          onH3={() => apply((v) => prefixLines(v, '### '))}
          onList={() => apply((v) => prefixLines(v, '- '))}
          onQuote={() => apply((v) => prefixLines(v, '> '))}
        />
      )}
    </div>
  )
}
