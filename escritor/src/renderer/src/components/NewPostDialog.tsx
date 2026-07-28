import { useState } from 'react'
import type { PostFrontmatter } from '../../../shared/types'

interface Props {
  busy: boolean
  onCancel: () => void
  onConfirm: (fm: PostFrontmatter) => void
}

export default function NewPostDialog({ busy, onCancel, onConfirm }: Props): React.JSX.Element {
  const [title, setTitle] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [summary, setSummary] = useState('')
  const [tags, setTags] = useState('')
  const [draft, setDraft] = useState(true)

  return (
    <div className="dialog-backdrop" role="presentation" onClick={onCancel}>
      <div
        className="dialog"
        role="dialog"
        aria-labelledby="new-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="new-title">Novo post</h2>
        <p>Cria um arquivo em src/content/posts no formato AAAA-MM-DD-slug.md.</p>
        <label>
          Título
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título do post"
            autoFocus
          />
        </label>
        <label>
          Data
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
        <label>
          Resumo
          <input
            type="text"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Uma linha"
          />
        </label>
        <label>
          Tags
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Engenharia, Cinema"
          />
        </label>
        <label className="check" style={{ flexDirection: 'row', marginBottom: '0.85rem' }}>
          <input type="checkbox" checked={draft} onChange={(e) => setDraft(e.target.checked)} />
          Começar como draft
        </label>
        <div className="dialog-actions">
          <button type="button" className="btn" onClick={onCancel} disabled={busy}>
            Cancelar
          </button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={busy || !title.trim()}
            onClick={() =>
              onConfirm({
                title: title.trim(),
                date,
                summary: summary.trim(),
                tags: tags
                  .split(',')
                  .map((t) => t.trim())
                  .filter(Boolean),
                draft
              })
            }
          >
            {busy ? 'Criando…' : 'Criar'}
          </button>
        </div>
      </div>
    </div>
  )
}
