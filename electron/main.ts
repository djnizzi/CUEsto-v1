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

ipcMain.handle('dialog:openHtml', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'HTML File', extensions: ['html', 'htm'] }]
  })
  if (canceled) {
    return null
  } else {
    const content = await fs.readFile(filePaths[0], 'utf-8')
    return { content, filepath: filePaths[0] }
  }
})

ipcMain.handle('dialog:saveFile', async (_, content: string, pathOrSuggestion?: string) => {
  // If pathOrSuggestion is an absolute path, overwrite.
  // Otherwise, use it as defaultPath in showSaveDialog.

  if (pathOrSuggestion && path.isAbsolute(pathOrSuggestion)) {
    await fs.writeFile(pathOrSuggestion, content, 'utf-8');
    return true;
  }

  const { canceled, filePath } = await dialog.showSaveDialog({
    defaultPath: pathOrSuggestion || 'untitled.cue',
    filters: [{ name: 'CUE Sheet', extensions: ['cue'] }]
  });

  if (canceled || !filePath) return false;

  await fs.writeFile(filePath, content, 'utf-8');
  return filePath; // return new path
})

ipcMain.handle('getAppVersion', () => {
  return app.getVersion();
});

ipcMain.handle('gnudb:fetchMetadata', async (_, gnucdid: string) => {
  const name = 'cuesto';
  const email = 'svinchu@kancho.com';
  const hello = `${name}+${email}+test+1.0`;
  const proto = '6';
  const baseUrl = 'https://gnudb.gnudb.org/~cddb/cddb.cgi?cmd=cddb+read+data+';

  const id = gnucdid.trim().split(/\s+/).pop() || gnucdid.trim();
  const url = `${baseUrl}${id}&hello=${hello}&proto=${proto}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error('GnuDB fetch failed:', response.status);
      return { error: `HTTP ${response.status}` };
    }
    const data = await response.text();

    // Parse the data in the main process for better logging visibility
    const result = parseGnuDbData(data);

    return { data, result };
  } catch (e: any) {
    console.error('GnuDB fetch error:', e.message);
    return { error: e.message };
  }
});

function parseGnuDbData(data: string) {
  if (!data.trim().startsWith('210')) {
    console.warn('GnuDB response did not start with 210 status.');
    return null;
  }

  const lines = data.split(/\r?\n/);
  let artist = '';
  let album = '';
  let year = '';
  let genre = '';
  const trackTitles: string[] = [];
  const trackOffsets: number[] = [];

  const dtitlePattern = /^DTITLE=([^/]*)\s*\/\s*(.*)$/;
  const ttitlePattern = /^TTITLE(\d+)=(.+)$/;
  const dyearPattern = /^DYEAR=(.*)$/;
  const dgenrePattern = /^DGENRE=(.*)$/;
  const offsetPattern = /^#\s*(\d+)$/; // More robust: match # followed by 0 or more whitespace then digits

  lines.forEach(line => {
    const trimmed = line.trim();

    const dmatch = trimmed.match(dtitlePattern);
    if (dmatch) {
      artist = dmatch[1].trim();
      album = dmatch[2].trim();
    }

    const ymatch = trimmed.match(dyearPattern);
    if (ymatch) {
      year = ymatch[1].trim();
    }

    const gmatch = trimmed.match(dgenrePattern);
    if (gmatch) {
      genre = gmatch[1].trim();
    }

    const tmatch = trimmed.match(ttitlePattern);
    if (tmatch) {
      const idx = parseInt(tmatch[1], 10);
      const title = tmatch[2].trim();
      if (trackTitles[idx] !== undefined) {
        trackTitles[idx] += title;
      } else {
        trackTitles[idx] = title;
      }
    }

    const omatch = trimmed.match(offsetPattern);
    if (omatch) {
      trackOffsets.push(parseInt(omatch[1], 10));
    }
  });

  if (trackOffsets.length === 0) {
    console.error('No track offsets found in XMCD data');
    return null;
  }

  console.log('\x1b[33m%s\x1b[0m', '--- GnuDB Timing Transformation (Terminal) ---');
  console.log(`Original first offset: ${trackOffsets[0]}`);
  trackOffsets[0] = 0; // Reset as per functions.py

  const tracks = [];
  for (let i = 0; i < trackTitles.length; i++) {
    let tTitle = trackTitles[i];
    let tArtist = artist;

    if (tTitle.includes(' / ')) {
      const parts = tTitle.split(' / ');
      if (parts.length >= 2) {
        tArtist = parts[0].trim();
        tTitle = parts.slice(1).join(' / ').trim();
      }
    }

    const offset = trackOffsets[i] || 0;
    // We'll return the raw offset and let the renderer convert it, 
    // but we'll log the conversion here too for the user to see.
    const timeStr = framesToTimeMain(offset);
    console.log(`Track ${i + 1}: Offset ${offset} -> ${timeStr}`);

    tracks.push({
      number: i + 1,
      title: tTitle,
      performer: tArtist,
      index01: offset
    });
  }
  console.log('\x1b[33m%s\x1b[0m', '----------------------------------------------');

  return { artist, album, year, genre, tracks };
}

function framesToTimeMain(frames: number): string {
  const FRAMES_PER_SECOND = 75;
  const f = frames % FRAMES_PER_SECOND;
  const remainingSeconds = Math.floor(frames / FRAMES_PER_SECOND);
  const s = remainingSeconds % 60;
  const m = Math.floor(remainingSeconds / 60);
  const format = (n: number) => n.toString().padStart(2, '0');
  return `${m}:${format(s)}:${format(f)}`;
}

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
    console.log('Loading DEV server:', VITE_DEV_SERVER_URL)
    win.loadURL(VITE_DEV_SERVER_URL)
    // win.webContents.openDevTools() // Disabled now that UI issue is resolved

    win.webContents.on('did-fail-load', (_event, errorCode, errorDescription, validatedURL) => {
      console.error(`Load failed: ${errorCode} ${errorDescription} at ${validatedURL}`);
    });
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
