# CUEsto Technical Documentation

## Overview
CUEsto is a modern, Electron-based desktop application for editing CUE sheets. It is built with React, TypeScript, and Vite, leveraging TailwindCSS for styling. The application is designed to be fast, responsive, and aesthetically pleasing with a dark-themed UI.

## Tech Stack
- **Runtime**: [Electron](https://www.electronjs.org/)
- **Frontend Framework**: [React](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [TailwindCSS](https://tailwindcss.com/)
- **Linting**: ESLint

### IPC Handlers
- **`dialog:openFile`**: Opens CUE/TXT files.
- **`dialog:openAudioFile`**: Uses `music-metadata` to return filename, duration in frames, and common tags (Artist, Title, Year, Genre).
- **`dialog:saveFile`**: Handles saving the generated CUE content to disk.
- **`getAppVersion`**: Returns the current application version from `package.json`.

### Key Components
- **`CueEditor.tsx`**: The main container component that manages the state of the CUE sheet (`CueSheet` object). It handles file operations (open/save), track updates, and renders the UI.
- **`TrackRow.tsx`**: Represents a single track in the cue sheet. Contains inputs for title, performer, start time, and duration.
- **`MetadataHeader.tsx`**: Displays and edits global CUE properties. Includes the audio file selector (disc icon) and total duration display.
- **`TimeInput.tsx`**: A specialized input component for handling timestamp formats (MM:SS:FF). Supports a read-only mode for calculated fields.

### Utilities
- **`cueParser.ts`**: Handles parsing of .cue files into state objects and generating string output for saving.
- **`tracklistParser.ts`**: Implements 1001tracklists.com HTML parsing using the browser's native `DOMParser`. It extracts metadata, tracks, and handles mashup logic (merging sub-tracks).
- **`gnudb.ts`**: Handles context-specific CD lookup via IPC.
- **`timeUtils.ts`**: Helper functions for frame/time conversions (75 frames per second).
- **Audio Metadata**: Uses `music-metadata` in the main process (via `dialog:openAudioFile` IPC) to extract duration and tags (Artist, Title, Year, Genre).

### State Management
State is largely local to `CueEditor.tsx`, with the `CueSheet` object serving as the single source of truth for the currently open file. Changes flow down to child components via props, and updates bubble up via callbacks.

## Setup & Build

### Prerequisites
- Node.js (v16+ recommended)
- npm or yarn

### Installation
```bash
npm install
```

### Development
Run the app in development mode with HMR:
```bash
npm run dev
```

### Production Build
Build the Electron app for production:
```bash
npm run build
```
The output will be in the `release` or `dist` folder depending on configuration.

## File Structure
```
v1/
├── src/
│   ├── components/    # React components (including GnuDbModal.tsx)
│   ├── lib/           # Utility functions (cueParser, gnudb, timeUtils)
│   ├── Main.tsx       # Entry point
│   └── index.css      # Global styles & Tailwind directives
├── electron/          # Main process code (includes GnuDB fetching logic)
├── dist/              # Built assets
└── package.json       # Dependencies and scripts
```
