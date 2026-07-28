# Escritor

App desktop para escrever posts Markdown do blog **jardim-digital**.

## Rodar

```bash
cd escritor
npm install
npm run dev
```

## O que faz

- Explorer só de `src/content/posts`
- Editor Markdown (CodeMirror) com toolbar na seleção
- Preview ao vivo
- Frontmatter: title, date, summary, tags, draft
- **Salvar** grava o `.md` no blog
- **Publicar** = `git add` do arquivo + `commit` + `push` (requer Git + remote `origin`)

Atalho: `Ctrl+S` salva.
