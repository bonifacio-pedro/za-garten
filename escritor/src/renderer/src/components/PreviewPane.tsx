import { useMemo } from 'react'
import { marked } from 'marked'

interface Props {
  body: string
  title: string
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function sanitizeHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/\son\w+="[^"]*"/gi, '')
    .replace(/\son\w+='[^']*'/gi, '')
    .replace(/javascript:/gi, '')
}

export default function PreviewPane({ body, title }: Props): React.JSX.Element {
  const html = useMemo(() => {
    const heading = title ? `# ${escapeHtml(title)}\n\n` : ''
    const raw = marked.parse(heading + body, { async: false }) as string
    return sanitizeHtml(raw)
  }, [body, title])

  return (
    <section className="preview-pane">
      <div className="pane-label">Preview</div>
      {body || title ? (
        <div className="preview-body" dangerouslySetInnerHTML={{ __html: html }} />
      ) : (
        <div className="empty">O preview aparece aqui.</div>
      )}
    </section>
  )
}
