import { useState } from 'react'

interface Props {
  filename: string
  defaultMessage: string
  busy: boolean
  onCancel: () => void
  onConfirm: (message: string) => void
}

export default function PublishDialog({
  filename,
  defaultMessage,
  busy,
  onCancel,
  onConfirm
}: Props): React.JSX.Element {
  const [message, setMessage] = useState(defaultMessage)

  return (
    <div className="dialog-backdrop" role="presentation" onClick={onCancel}>
      <div
        className="dialog"
        role="dialog"
        aria-labelledby="publish-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="publish-title">Publicar</h2>
        <p>
          Faz <code>git add</code> de <strong>{filename}</strong>, commit e push para{' '}
          <code>origin</code>.
        </p>
        <label>
          Mensagem do commit
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            autoFocus
          />
        </label>
        <div className="dialog-actions">
          <button type="button" className="btn" onClick={onCancel} disabled={busy}>
            Cancelar
          </button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={busy || !message.trim()}
            onClick={() => onConfirm(message)}
          >
            {busy ? 'Publicando…' : 'Publicar'}
          </button>
        </div>
      </div>
    </div>
  )
}
