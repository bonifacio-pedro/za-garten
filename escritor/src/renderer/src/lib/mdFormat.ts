import type { EditorView } from '@codemirror/view'

export function wrapSelection(view: EditorView, before: string, after: string): void {
  const { from, to } = view.state.selection.main
  const selected = view.state.sliceDoc(from, to)
  view.dispatch({
    changes: { from, to, insert: before + selected + after },
    selection: {
      anchor: from + before.length,
      head: from + before.length + selected.length
    }
  })
}

export function prefixLines(view: EditorView, prefix: string): void {
  const { from, to } = view.state.selection.main
  const startLine = view.state.doc.lineAt(from)
  const endLine = view.state.doc.lineAt(to)
  const changes: { from: number; to: number; insert: string }[] = []

  for (let n = startLine.number; n <= endLine.number; n++) {
    const line = view.state.doc.line(n)
    if (line.text.startsWith(prefix)) continue
    changes.push({ from: line.from, to: line.from, insert: prefix })
  }

  if (changes.length === 0) return
  view.dispatch({ changes })
}
