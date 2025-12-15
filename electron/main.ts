import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import fs from 'node:fs/promises'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
// ... (keep constants)

// Handlers
ipcMain.handle('dialog:openFile', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'CUE Sheet', extensions: ['cue', 'txt'] }]
  })
  if (canceled) {
    return null
  } else {
    const content = await fs.readFile(filePaths[0], 'utf-8')
    return { content, filepath: filePaths[0] }
  }
})

ipcMain.handle('dialog:saveFile', async (_, content: string, defaultPath?: string) => {
  // If we have a path, just write? or always ask?
  // "Save" usually means write to existing. "Save As" means ask.
  // For now let's implement Save As behavior if no defaultPath, or just write if exists.
  // But let's assume we want "Save As" behavior primarily for "Save" button if passing undefined?
  // Or if passing path, write directly.

  if (defaultPath) {
    await fs.writeFile(defaultPath, content, 'utf-8');
    return true;
  }

  const { canceled, filePath } = await dialog.showSaveDialog({
    defaultPath: 'untitled.cue',
    filters: [{ name: 'CUE Sheet', extensions: ['cue'] }]
  });

  if (canceled || !filePath) return false;

  await fs.writeFile(filePath, content, 'utf-8');
  return filePath; // return new path
})

// ... (keep rest)

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null

function createWindow() {
  win = new BrowserWindow({
    width: 900,
    height: 700,
    icon: path.join(process.env.VITE_PUBLIC, 'cuesto.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
    autoHideMenuBar: true, // Hide the default menu
  })
  win.setMenu(null); // Explicitly remove it

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(createWindow)
