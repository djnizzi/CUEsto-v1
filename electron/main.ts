import { app, BrowserWindow, ipcMain, dialog, WebContentsView, Menu, MenuItem, clipboard } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import fs from 'node:fs/promises'
import * as mm from 'music-metadata'
import { MusicBrainzApi } from 'musicbrainz-api'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const mbApi = new MusicBrainzApi({
  appName: 'CUEsto',
  appVersion: '1.0.8', // We'll update this or get from package.json if needed
  appContactInfo: 'https://github.com/NiZDesign/cuesto'
});

async function getSecrets() {
  const rootPath = path.join(process.env.APP_ROOT || path.join(__dirname, '..'), '..');
  const v1Path = path.join(rootPath, 'v1');
  const credsPath = path.join(v1Path, 'electron', 'credentials.ts');

  console.log(`Checking Discogs credentials at: ${credsPath}`);

  try {
    const credsContent = await fs.readFile(credsPath, 'utf-8');
    const tokenMatch = credsContent.match(/DISCOGS_TOKEN\s*=\s*(['"`])(.*?)\1/);
    if (tokenMatch && tokenMatch[2]) {
      const token = tokenMatch[2];
      console.log(`[AUTH] Found token in credentials.ts: "${token}"`);
      return { API: { key: token }, APP: { appname: 'CUEsto' } };
    } else {
      console.warn('[AUTH] credentials.ts found but DISCOGS_TOKEN match failed.');
      console.log('[AUTH] File content snippet:', credsContent.substring(0, 100).replace(/\r?\n/g, ' '));
    }
  } catch (e: any) {
    console.error(`[AUTH] Error reading credentials.ts: ${e.message}`);
  }

  return null;
}

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

ipcMain.handle('dialog:openLabels', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'Audacity Labels', extensions: ['txt'] }]
  })
  if (canceled) {
    return null
  } else {
    const content = await fs.readFile(filePaths[0], 'utf-8')
    return { content, filepath: filePaths[0] }
  }
})


ipcMain.handle('dialog:openAudioFile', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'Audio Files', extensions: ['mp3', 'wav', 'flac', 'm4a', 'ogg', 'opus'] }]
  })
  if (canceled) {
    return null
  } else {
    const filePath = filePaths[0]
    try {
      const metadata = await mm.parseFile(filePath)
      const durationSeconds = metadata.format.duration || 0
      // Convert to frames (75 fps)
      const totalFrames = Math.floor(durationSeconds * 75)
      return {
        filename: path.basename(filePath),
        filepath: filePath,
        durationFrames: totalFrames,
        metadata: {
          title: metadata.common.title || '',
          artist: metadata.common.albumartist || metadata.common.artist || '',
          year: metadata.common.year?.toString() || '',
          genre: metadata.common.genre?.[0] || ''
        }
      }
    } catch (error) {
      console.error('Error parsing audio metadata:', error)
      return {
        filename: path.basename(filePath),
        filepath: filePath,
        durationFrames: 0,
        error: 'Could not extract duration'
      }
    }
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

  const maxRetries = 2;
  const retryDelay = 2000;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        console.log(`GnuDB Retry attempt ${attempt}...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }

      const response = await fetch(url);

      if (response.ok) {
        const data = await response.text();
        const result = parseGnuDbData(data);
        if (result) {
          return { data, result };
        } else {
          return { error: 'Invalid XMCD format returned from GnuDB.' };
        }
      }

      if (response.status === 403) {
        return { error: 'GnuDB requires registration or a unique email address (403).' };
      }

      if (response.status === 404) {
        return { error: 'CD ID not found in GnuDB (404).' };
      }

      if (response.status >= 500 && attempt < maxRetries) {
        console.warn(`Attempt ${attempt + 1} failed with server error ${response.status}. Retrying...`);
        continue;
      }

      return { error: `GnuDB returned an error: ${response.status}` };

    } catch (e: any) {
      console.error(`Fetch attempt ${attempt + 1} error:`, e.message);
      if (attempt === maxRetries) {
        return { error: `Connection error: ${e.message}` };
      }
    }
  }

  return { error: 'Failed to retrieve metadata after multiple attempts.' };
});

ipcMain.handle('discogs:fetchMetadata', async (_, releaseCode: string) => {
  const secrets = await getSecrets();
  if (!secrets || !secrets.API?.key) {
    return { error: 'Discogs API token not found. Please add it to electron/credentials.ts.' };
  }

  const apiKey = secrets.API.key;
  const userAgent = `${secrets.APP?.appname || 'CUEsto'}/1.0.6`;

  // Accept r12345, [r12345], 12345 etc.
  const releaseId = releaseCode.replace(/\D/g, '');
  if (!releaseId) {
    return { error: 'Invalid release code format. Please provide the numeric release ID.' };
  }
  const url = `https://api.discogs.com/releases/${releaseId}`;

  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Discogs token=${apiKey}`,
        'User-Agent': userAgent
      }
    });

    if (response.ok) {
      const data = await response.json();
      const result = parseDiscogsData(data, releaseId);
      if (result) {
        return { result };
      } else {
        return { error: 'Failed to parse Discogs response.' };
      }
    }

    if (response.status === 404) {
      return { error: 'Release not found in Discogs (404).' };
    }

    return { error: `Discogs returned an error: ${response.status} ${response.statusText}` };
  } catch (e: any) {
    console.error(`Discogs fetch error:`, e.message);
    return { error: `Connection error: ${e.message}` };
  }
});

ipcMain.handle('musicbrainz:fetchMetadata', async (_, discId: string) => {
  try {
    // lookupDiscId is not available in v1.0.0, use restGet instead
    // MusicBrainz API for discid: /ws/2/discid/<discid>?inc=recordings+artists+labels+release-groups&fmt=json
    // NOTE: 'releases' and 'discids' are not valid/needed here for the discid resource.
    const disc: any = await (mbApi as any).restGet(`/discid/${discId}`, {
      inc: 'recordings artists labels release-groups'
    });

    // MusicBrainz can return an error object with a 200 status code in some cases or via restGet
    if (disc && disc.error) {
      return { error: `MusicBrainz API error: ${disc.error}` };
    }

    if (disc && disc.releases && disc.releases.length > 0) {
      // Return the disc details (offsets) and the first release
      return { result: { disc, release: disc.releases[0] } };
    }

    if (disc && disc.id && (!disc.releases || disc.releases.length === 0)) {
      return { error: 'Disc ID found as a "CD Stub" but not yet attached to any release in MusicBrainz.' };
    }

    return { error: 'No releases found for this Disc ID.' };
  } catch (e: any) {
    console.error('MusicBrainz fetch error:', e);
    // If it's a 404 from the API, it means the Disc ID itself isn't known
    if (e.message?.includes('404')) {
      return { error: 'Disc ID not found in MusicBrainz database.' };
    }
    return { error: `MusicBrainz error: ${e.message}` };
  }
});

let viewerContent = '';

ipcMain.handle('window:open-viewer', (_, content: string) => {
  viewerContent = content;
  createViewerWindow();
});

ipcMain.handle('viewer:get-content', () => {
  return viewerContent;
});

function parseDiscogsData(data: any, releaseId?: string) {
  try {
    const artist = data.artists?.map((a: any) => a.name.replace(/\s\(\d+\)$/, '')).join(', ') || 'Unknown Artist';
    const album = data.title || 'Unknown Album';
    const year = data.year?.toString() || '';
    const genre = data.genres?.[0] || '';

    const tracks = (data.tracklist || [])
      .filter((t: any) => t.type_ === 'track')
      .map((t: any, i: number) => {
        let tArtist = artist;
        if (t.artists && t.artists.length > 0) {
          tArtist = t.artists.map((a: any) => a.name.replace(/\s\(\d+\)$/, '')).join(', ');
        }

        return {
          number: i + 1,
          title: t.title || 'Untitled',
          performer: tArtist || artist,
          duration: t.duration || '',
          position: t.position || ''
        };
      });

    return { artist, album, year, genre, tracks, releaseCode: releaseId };
  } catch (e) {
    console.error('Error parsing Discogs data:', e);
    return null;
  }
}

function getBrowserStatus(view: WebContentsView) {
  return {
    canGoBack: view.webContents.canGoBack(),
    canGoForward: view.webContents.canGoForward(),
    title: view.webContents.getTitle(),
    url: view.webContents.getURL()
  };
}

ipcMain.handle('browser:get-status', (event) => {
  // Find the view associated with the window that sent this
  const win = BrowserWindow.fromWebContents(event.sender);
  if (!win) return null;
  const view = (win as any).browserView; // We'll store it here
  if (!view) return null;
  return getBrowserStatus(view);
});

ipcMain.on('browser:go-back', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  const view = win ? (win as any).browserView : null;
  if (view && view.webContents.canGoBack()) {
    view.webContents.goBack();
  }
});

ipcMain.on('browser:go-forward', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  const view = win ? (win as any).browserView : null;
  if (view && view.webContents.canGoForward()) {
    view.webContents.goForward();
  }
});

function createSearchWindow(url: string) {
  const searchWin = new BrowserWindow({
    width: 1024,
    height: 800,
    icon: path.join(process.env.VITE_PUBLIC, 'cuesto.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
    autoHideMenuBar: true,
  });
  searchWin.setMenu(null);

  const view = new WebContentsView();
  (searchWin as any).browserView = view;
  searchWin.contentView.addChildView(view);

  const HEADER_HEIGHT = 60; // Matching BrowserShell.tsx header

  const updateViewBounds = () => {
    const [width, height] = searchWin.getContentSize();
    view.setBounds({ x: 0, y: HEADER_HEIGHT, width, height: height - HEADER_HEIGHT });
  };

  searchWin.on('resize', updateViewBounds);
  updateViewBounds();

  // Load the React app in browser mode
  if (VITE_DEV_SERVER_URL) {
    searchWin.loadURL(`${VITE_DEV_SERVER_URL}?mode=browser`);
  } else {
    searchWin.loadFile(path.join(RENDERER_DIST, 'index.html'), { query: { mode: 'browser' } });
  }

  view.webContents.loadURL(url);

  // Sync status back to React
  const syncStatus = () => {
    if (searchWin.isDestroyed()) return;
    searchWin.webContents.send('browser:status-updated', getBrowserStatus(view));
  };

  view.webContents.on('did-navigate', syncStatus);
  view.webContents.on('did-navigate-in-page', syncStatus);
  view.webContents.on('page-title-updated', syncStatus);

  view.webContents.on('context-menu', (_, params) => {
    if (params.linkURL) {
      const menu = new Menu();
      menu.append(new MenuItem({
        label: 'Copy Link',
        click: () => {
          clipboard.writeText(params.linkURL);
        }
      }));
      menu.append(new MenuItem({
        label: 'Open in New Window',
        click: () => {
          createSearchWindow(params.linkURL);
        }
      }));
      menu.popup();
    }
  });

  view.webContents.setWindowOpenHandler(({ url }) => {
    createSearchWindow(url);
    return { action: 'deny' };
  });

  return searchWin;
}

function createViewerWindow() {
  const viewerWin = new BrowserWindow({
    width: 800,
    height: 800,
    icon: path.join(process.env.VITE_PUBLIC, 'cuesto.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
    autoHideMenuBar: true,
  });
  viewerWin.setMenu(null);

  if (VITE_DEV_SERVER_URL) {
    viewerWin.loadURL(`${VITE_DEV_SERVER_URL}?mode=viewer`);
  } else {
    viewerWin.loadFile(path.join(RENDERER_DIST, 'index.html'), { query: { mode: 'viewer' } });
  }

  return viewerWin;
}

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

const gotLock = app.requestSingleInstanceLock()

if (!gotLock) {
  app.quit()
} else {
  app.on('second-instance', (_, argv) => {
    if (win) {
      if (win.isMinimized()) win.restore()
      win.focus()

      // Handle file opened while app is running
      const filePath = argv.find(arg => arg.endsWith('.cue') || arg.endsWith('.txt'))
      if (filePath) {
        handleFileOpen(filePath)
      }
    }
  })
}

async function handleFileOpen(filePath: string) {
  try {
    const content = await fs.readFile(filePath, 'utf-8')
    win?.webContents.send('file-opened', { content, filePath })
  } catch (e) {
    console.error('Failed to read file', e)
  }
}

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

  win.webContents.setWindowOpenHandler(({ url }: { url: string }) => {
    createSearchWindow(url);
    return { action: 'deny' };
  });

  win.webContents.on('did-finish-load', async () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString());

    // Check for startup file (Windows File Association)
    const filePath = process.argv.find(arg => arg.endsWith('.cue') || arg.endsWith('.txt'))
    if (filePath) {
      handleFileOpen(filePath)
    }
  })

  if (VITE_DEV_SERVER_URL) {
    console.log('Loading DEV server:', VITE_DEV_SERVER_URL)
    win.loadURL(VITE_DEV_SERVER_URL)
    win.webContents.on('did-fail-load', (_event: any, errorCode: number, errorDescription: string, validatedURL: string) => {
      console.error(`Load failed: ${errorCode} ${errorDescription} at ${validatedURL}`);
    });
  } else {
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(createWindow)
