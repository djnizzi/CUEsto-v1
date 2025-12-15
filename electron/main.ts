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

ipcMain.handle('getAppVersion', () => {
  return app.getVersion();
});

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

  // Handle startup file (Windows File Association)
  // Usually process.argv[1] is the file path if opened via association.
  // In dev, 0 is electron, 1 is ., 2 might be file. In prod, 0 is exe, 1 is file.
  // We need to be careful.

  const getStartupFile = async () => {
    let filePath = '';

    if (app.isPackaged) {
      if (process.argv.length >= 2) {
        filePath = process.argv[1];
      }
    } else {
      // Dev mode: 'electron . filepath'
      if (process.argv.length >= 3) {
        filePath = process.argv[2];
      }
    }

    if (filePath && (filePath.endsWith('.cue') || filePath.endsWith('.txt'))) {
      try {
        const content = await fs.readFile(filePath, 'utf-8');
        // Wait for React to be ready? 
        // We can send it when did-finish-load fires.
        return { content, filePath };
      } catch (e) {
        console.error('Failed to read startup file', e);
      }
    }
    return null;
  };

  win.webContents.on('did-finish-load', async () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString());

    // Check and send file
    const startupData = await getStartupFile();
    if (startupData) {
      win?.webContents.send('file-opened', startupData);
    }
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
