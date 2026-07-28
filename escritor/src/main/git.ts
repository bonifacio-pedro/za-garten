import { existsSync } from 'fs'
import { join } from 'path'
import simpleGit from 'simple-git'
import type { PublishResult } from '../shared/types'

function assertSafeFilename(filename: string): void {
  if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    throw new Error('Nome de arquivo inválido')
  }
  if (!/\.(md|mdx)$/i.test(filename)) {
    throw new Error('Arquivo deve ser .md ou .mdx')
  }
}

export async function publishPosts(
  blogRoot: string,
  filenames: string[],
  message: string
): Promise<PublishResult> {
  try {
    if (!filenames.length) {
      return { ok: false, message: 'Nenhum arquivo para publicar.' }
    }
    if (!message.trim()) {
      return { ok: false, message: 'Informe uma mensagem de commit.' }
    }

    const gitDir = join(blogRoot, '.git')
    if (!existsSync(gitDir)) {
      return {
        ok: false,
        message:
          'Repositório Git não encontrado na raiz do blog. Rode `git init` e configure o remote `origin` antes de publicar.'
      }
    }

    for (const f of filenames) assertSafeFilename(f)

    const git = simpleGit({ baseDir: blogRoot })

    try {
      await git.raw(['--version'])
    } catch {
      return {
        ok: false,
        message: 'Git não encontrado no PATH. Instale o Git e reinicie o Escritor.'
      }
    }

    const remotes = await git.getRemotes(true)
    const origin = remotes.find((r) => r.name === 'origin')
    if (!origin) {
      return {
        ok: false,
        message:
          'Remote `origin` não configurado. Adicione o remote (ex.: GitHub) antes de publicar.'
      }
    }

    // Git expects forward-slash relative paths
    const relativePaths = filenames.map((f) => `src/content/posts/${f}`)

    for (const rel of relativePaths) {
      const abs = join(blogRoot, ...rel.split('/'))
      if (!existsSync(abs)) {
        return { ok: false, message: `Arquivo não encontrado: ${rel}` }
      }
    }

    await git.add(relativePaths)

    const status = await git.status()
    if (status.staged.length === 0 && status.created.length === 0) {
      // simple-git may list differently; check if there's anything to commit for these files
      const porcelain = await git.raw(['status', '--porcelain', '--', ...relativePaths])
      if (!porcelain.trim()) {
        // Still try commit — maybe already staged earlier; if nothing, commit will fail gracefully
      }
    }

    try {
      await git.commit(message.trim())
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      if (/nothing to commit/i.test(msg) || /no changes/i.test(msg)) {
        return {
          ok: false,
          message: 'Nada para commitar — o arquivo já está sincronizado com o último commit.'
        }
      }
      return { ok: false, message: `Falha no commit: ${msg}` }
    }

    try {
      await git.push()
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      return {
        ok: false,
        message: `Commit criado, mas o push falhou: ${msg}`
      }
    }

    return { ok: true, message: `Publicado: ${filenames.join(', ')}` }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return { ok: false, message: msg }
  }
}
