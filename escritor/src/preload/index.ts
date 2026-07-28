import { contextBridge, ipcRenderer } from 'electron'
import type { EscritorApi, PostFrontmatter } from '../shared/types'

const api: EscritorApi = {
  listPosts: () => ipcRenderer.invoke('posts:list'),
  readPost: (filename) => ipcRenderer.invoke('posts:read', filename),
  savePost: (filename, frontmatter, body) =>
    ipcRenderer.invoke('posts:save', filename, frontmatter, body),
  createPost: (frontmatter: PostFrontmatter, body?: string) =>
    ipcRenderer.invoke('posts:create', frontmatter, body),
  publish: (filenames, message) => ipcRenderer.invoke('git:publish', filenames, message),
  getPostsPath: () => ipcRenderer.invoke('posts:path')
}

contextBridge.exposeInMainWorld('escritor', api)
