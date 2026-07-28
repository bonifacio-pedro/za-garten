import type { PostListItem } from '../../../shared/types'

interface Props {
  posts: PostListItem[]
  postsPath: string
  activeFilename: string | null
  onSelect: (filename: string) => void
}

export default function PostExplorer({
  posts,
  postsPath,
  activeFilename,
  onSelect
}: Props): React.JSX.Element {
  return (
    <aside className="sidebar">
      <div className="sidebar-head">Posts</div>
      <div className="sidebar-path" title={postsPath}>
        {postsPath || '…'}
      </div>
      <ul className="post-list">
        {posts.map((p) => (
          <li key={p.filename}>
            <button
              type="button"
              className={`post-item${activeFilename === p.filename ? ' active' : ''}`}
              onClick={() => onSelect(p.filename)}
            >
              <span className="post-item-title">{p.title}</span>
              <span className="post-item-meta">
                <span>{p.date}</span>
                {p.draft && <span className="badge-draft">draft</span>}
              </span>
            </button>
          </li>
        ))}
        {posts.length === 0 && (
          <li>
            <div className="empty" style={{ padding: '1rem 0.5rem' }}>
              Nenhum post ainda.
            </div>
          </li>
        )}
      </ul>
    </aside>
  )
}
