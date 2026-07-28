import { app, BrowserWindow, ipcMain, shell } from 'electron'
import { existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import {
  listPosts,
  readPost,
  savePost,
  createPost,
  getPostsDir,
  getBlogRoot
} from './posts'
import { publishPosts } from './git'
import type { PostFrontmatter } from '../shared/types'

const __dirname = dirname(fileURLToPath(import.meta.url))

function resolvePreload(): string {
  const mjs = join(__dirname, '../preload/index.mjs')
  const js = join(__dirname, '../preload/index.js')
  return existsSync(mjs) ? mjs : js
}

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    show: false,
    title: 'Escritor',
    autoHideMenuBar: true,
    webPreferences: {
      preload: resolvePreload(),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

function registerIpc(): void {
  ipcMain.handle('posts:list', () => listPosts())
  ipcMain.handle('posts:read', (_e, filename: string) => readPost(filename))
  ipcMain.handle(
    'posts:save',
    (_e, filename: string, frontmatter: PostFrontmatter, body: string) =>
      savePost(filename, frontmatter, body)
  )
  ipcMain.handle(
    'posts:create',
    (_e, frontmatter: PostFrontmatter, body?: string) => createPost(frontmatter, body)
  )
  ipcMain.handle('posts:path', () => getPostsDir())
  ipcMain.handle('git:publish', (_e, filenames: string[], message: string) =>
    publishPosts(getBlogRoot(), filenames, message)
  )
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.jardim.escritor')

  app.on('browser-window-created', (_event, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  registerIpc()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
