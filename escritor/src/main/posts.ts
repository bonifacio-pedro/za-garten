import { existsSync, readdirSync, readFileSync, writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { app } from 'electron'
import type { PostContent, PostFrontmatter, PostListItem } from '../shared/types'

const __dirname = dirname(fileURLToPath(import.meta.url))

/** Blog root = parent of escritor/ (dev: from source tree; prod: next to packaged app location). */
export function getBlogRoot(): string {
  // In electron-vite, app.getAppPath() points at escritor/ (or out/)
  // Walk up until we find src/content/posts or fall back to parent of escritor.
  const candidates = [
    join(app.getAppPath(), '..'),
    join(app.getAppPath(), '../..'),
    join(__dirname, '../../../..'),
    join(__dirname, '../../../../..'),
    join(process.cwd(), '..'),
    process.cwd()
  ]

  for (const root of candidates) {
    if (existsSync(join(root, 'src', 'content', 'posts'))) {
      return root
    }
  }

  // Default: assume cwd is escritor/ during `npm run dev`
  return join(process.cwd(), '..')
}

export function getPostsDir(): string {
  const dir = join(getBlogRoot(), 'src', 'content', 'posts')
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }
  return dir
}

function parseFrontmatter(raw: string): { frontmatter: PostFrontmatter; body: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  if (!match) {
    return {
      frontmatter: {
        title: '',
        date: new Date().toISOString().slice(0, 10),
        summary: '',
        tags: [],
        draft: false
      },
      body: raw
    }
  }

  const yaml = match[1]
  const body = match[2] ?? ''
  const get = (key: string): string | undefined => {
    const m = yaml.match(new RegExp(`^${key}:\\s*(.*)$`, 'm'))
    return m ? m[1].trim() : undefined
  }

  const titleRaw = get('title') ?? ''
  const title = titleRaw.replace(/^["']|["']$/g, '')
  const date = (get('date') ?? new Date().toISOString().slice(0, 10)).replace(/^["']|["']$/g, '')
  const summaryRaw = get('summary') ?? ''
  const summary = summaryRaw.replace(/^["']|["']$/g, '')
  const draftRaw = get('draft')
  const draft = draftRaw === 'true'

  let tags: string[] = []
  const tagsLine = get('tags')
  if (tagsLine) {
    const arr = tagsLine.match(/\[(.*)\]/)
    if (arr) {
      tags = arr[1]
        .split(',')
        .map((t) => t.trim().replace(/^["']|["']$/g, ''))
        .filter(Boolean)
    }
  }

  return {
    frontmatter: { title, date, summary, tags, draft },
    body
  }
}

function serializeFrontmatter(fm: PostFrontmatter): string {
  const tags =
    fm.tags.length === 0
      ? '[]'
      : `[${fm.tags.map((t) => JSON.stringify(t)).join(', ')}]`
  return [
    '---',
    `title: ${JSON.stringify(fm.title)}`,
    `date: ${fm.date}`,
    `summary: ${JSON.stringify(fm.summary)}`,
    `tags: ${tags}`,
    `draft: ${fm.draft}`,
    '---',
    ''
  ].join('\n')
}

function assertSafeFilename(filename: string): void {
  if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    throw new Error('Nome de arquivo inválido')
  }
  if (!/\.(md|mdx)$/i.test(filename)) {
    throw new Error('Arquivo deve ser .md ou .mdx')
  }
}

export function listPosts(): PostListItem[] {
  const dir = getPostsDir()
  const files = readdirSync(dir).filter((f) => /\.(md|mdx)$/i.test(f))

  const items: PostListItem[] = files.map((filename) => {
    const raw = readFileSync(join(dir, filename), 'utf-8')
    const { frontmatter } = parseFrontmatter(raw)
    return {
      filename,
      title: frontmatter.title || filename,
      date: frontmatter.date,
      draft: frontmatter.draft
    }
  })

  items.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.filename.localeCompare(b.filename)))
  return items
}

export function readPost(filename: string): PostContent {
  assertSafeFilename(filename)
  const raw = readFileSync(join(getPostsDir(), filename), 'utf-8')
  const { frontmatter, body } = parseFrontmatter(raw)
  return { filename, frontmatter, body }
}

export function savePost(filename: string, frontmatter: PostFrontmatter, body: string): void {
  assertSafeFilename(filename)
  const content = serializeFrontmatter(frontmatter) + (body.endsWith('\n') ? body : body + '\n')
  writeFileSync(join(getPostsDir(), filename), content, 'utf-8')
}

function slugify(title: string): string {
  return title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'post'
}

export function createPost(frontmatter: PostFrontmatter, body = ''): PostContent {
  const date = frontmatter.date || new Date().toISOString().slice(0, 10)
  const slug = slugify(frontmatter.title || 'novo-post')
  let filename = `${date}-${slug}.md`
  const dir = getPostsDir()

  let n = 2
  while (existsSync(join(dir, filename))) {
    filename = `${date}-${slug}-${n}.md`
    n += 1
  }

  const fm = { ...frontmatter, date }
  savePost(filename, fm, body || '## \n\n')
  return { filename, frontmatter: fm, body: body || '## \n\n' }
}
