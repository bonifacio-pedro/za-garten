import type { PostFrontmatter } from '../../../shared/types'

interface Props {
  value: PostFrontmatter
  onChange: (next: PostFrontmatter) => void
}

export default function FrontmatterFields({ value, onChange }: Props): React.JSX.Element {
  const set = <K extends keyof PostFrontmatter>(key: K, v: PostFrontmatter[K]): void => {
    onChange({ ...value, [key]: v })
  }

  return (
    <div className="frontmatter">
      <label className="span-2">
        Título
        <input
          type="text"
          value={value.title}
          onChange={(e) => set('title', e.target.value)}
          placeholder="Título do post"
        />
      </label>
      <label>
        Data
        <input type="date" value={value.date} onChange={(e) => set('date', e.target.value)} />
      </label>
      <label className="check">
        <input
          type="checkbox"
          checked={value.draft}
          onChange={(e) => set('draft', e.target.checked)}
        />
        Draft
      </label>
      <label className="span-2">
        Resumo
        <input
          type="text"
          value={value.summary}
          onChange={(e) => set('summary', e.target.value)}
          placeholder="Uma linha para a home e meta description"
        />
      </label>
      <label className="span-2">
        Tags (separadas por vírgula)
        <input
          type="text"
          value={value.tags.join(', ')}
          onChange={(e) =>
            set(
              'tags',
              e.target.value
                .split(',')
                .map((t) => t.trim())
                .filter(Boolean)
            )
          }
          placeholder="Engenharia, Cinema"
        />
      </label>
    </div>
  )
}
