import { useCallback, useEffect, useState } from 'react'
import type { PostContent, PostFrontmatter, PostListItem } from '../../shared/types'
import PostExplorer from './components/PostExplorer'
import FrontmatterFields from './components/FrontmatterFields'
import MarkdownEditor from './components/MarkdownEditor'
import PreviewPane from './components/PreviewPane'
import PublishDialog from './components/PublishDialog'
import NewPostDialog from './components/NewPostDialog'

const emptyFm = (): PostFrontmatter => ({
  title: '',
  date: new Date().toISOString().slice(0, 10),
  summary: '',
  tags: [],
  draft: true
})

export default function App(): React.JSX.Element {
  const [posts, setPosts] = useState<PostListItem[]>([])
  const [postsPath, setPostsPath] = useState('')
  const [active, setActive] = useState<PostContent | null>(null)
  const [frontmatter, setFrontmatter] = useState<PostFrontmatter>(emptyFm())
  const [body, setBody] = useState('')
  const [dirty, setDirty] = useState(false)
  const [status, setStatus] = useState<{ kind: 'ok' | 'error' | ''; text: string }>({
    kind: '',
    text: ''
  })
  const [busy, setBusy] = useState(false)
  const [showPublish, setShowPublish] = useState(false)
  const [showNew, setShowNew] = useState(false)

  const refreshList = useCallback(async () => {
    const [list, path] = await Promise.all([
      window.escritor.listPosts(),
      window.escritor.getPostsPath()
    ])
    setPosts(list)
    setPostsPath(path)
  }, [])

  useEffect(() => {
    refreshList().catch((err) => {
      setStatus({ kind: 'error', text: String(err) })
    })
  }, [refreshList])

  const openPost = async (filename: string): Promise<void> => {
    if (dirty && !confirm('Há alterações não salvas. Descartar?')) return
    const post = await window.escritor.readPost(filename)
    setActive(post)
    setFrontmatter(post.frontmatter)
    setBody(post.body)
    setDirty(false)
    setStatus({ kind: '', text: post.filename })
  }

  const updateFm = (next: PostFrontmatter): void => {
    setFrontmatter(next)
    setDirty(true)
  }

  const updateBody = (next: string): void => {
    setBody(next)
    setDirty(true)
  }

  const save = async (): Promise<void> => {
    if (!active) return
    setBusy(true)
    try {
      await window.escritor.savePost(active.filename, frontmatter, body)
      setDirty(false)
      setStatus({ kind: 'ok', text: `Salvo: ${active.filename}` })
      await refreshList()
    } catch (err) {
      setStatus({ kind: 'error', text: String(err) })
    } finally {
      setBusy(false)
    }
  }

  const createPost = async (fm: PostFrontmatter): Promise<void> => {
    setBusy(true)
    try {
      const post = await window.escritor.createPost(fm, '## \n\n')
      setActive(post)
      setFrontmatter(post.frontmatter)
      setBody(post.body)
      setDirty(false)
      setShowNew(false)
      setStatus({ kind: 'ok', text: `Criado: ${post.filename}` })
      await refreshList()
    } catch (err) {
      setStatus({ kind: 'error', text: String(err) })
    } finally {
      setBusy(false)
    }
  }

  const publish = async (message: string): Promise<void> => {
    if (!active) return
    setBusy(true)
    try {
      if (dirty) {
        await window.escritor.savePost(active.filename, frontmatter, body)
        setDirty(false)
      }
      const result = await window.escritor.publish([active.filename], message)
      setStatus({ kind: result.ok ? 'ok' : 'error', text: result.message })
      if (result.ok) setShowPublish(false)
      await refreshList()
    } catch (err) {
      setStatus({ kind: 'error', text: String(err) })
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault()
        if (active && !busy) void save()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active, busy, frontmatter, body, dirty])

  return (
    <div className="app">
      <header className="toolbar">
        <div className="brand">Escritor</div>
        <button type="button" className="btn" onClick={() => setShowNew(true)} disabled={busy}>
          Novo
        </button>
        <button type="button" className="btn" onClick={() => void save()} disabled={!active || busy}>
          Salvar{dirty ? ' •' : ''}
        </button>
        <div className="toolbar-spacer" />
        <span className={`status ${status.kind}`}>{status.text}</span>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setShowPublish(true)}
          disabled={!active || busy}
        >
          Publicar
        </button>
      </header>

      <div className="workspace">
        <PostExplorer
          posts={posts}
          postsPath={postsPath}
          activeFilename={active?.filename ?? null}
          onSelect={(f) => void openPost(f)}
        />

        <section className="editor-pane">
          {active ? (
            <>
              <div className="pane-label">Editor — {active.filename}</div>
              <FrontmatterFields value={frontmatter} onChange={updateFm} />
              <MarkdownEditor value={body} onChange={updateBody} />
            </>
          ) : (
            <div className="empty">
              Selecione um post no explorer ou clique em <strong>Novo</strong>.
            </div>
          )}
        </section>

        <PreviewPane body={body} title={frontmatter.title} />
      </div>

      {showNew && (
        <NewPostDialog
          busy={busy}
          onCancel={() => setShowNew(false)}
          onConfirm={(fm) => void createPost(fm)}
        />
      )}

      {showPublish && active && (
        <PublishDialog
          filename={active.filename}
          defaultMessage={`post: ${frontmatter.title || active.filename}`}
          busy={busy}
          onCancel={() => setShowPublish(false)}
          onConfirm={(msg) => void publish(msg)}
        />
      )}
    </div>
  )
}
