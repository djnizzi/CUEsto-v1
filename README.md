# CUEsto
> A modern, electron-based CUE sheet editor built for speed and aesthetics.

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
![Version](https://img.shields.io/badge/version-v1.0.7-green.svg)
![Status](https://img.shields.io/badge/status-active-success.svg)

**CUEsto** is a powerful desktop application designed to make CUE sheet editing effortless. Built with modern web technologies, it offers a sleek dark-mode interface, real-time duration calculations, and intuitive metadata management.

## Features

- 🎨 **Modern UI**: A focused, dark-themed interface built with TailwindCSS.
- ⚡ **Fast & Responsive**: Built on Vite and React for instant feedback.
- ⏱️ **Metadata Persistence**: Support for custom `REM` lines, including `TOTAL DURATION`, `GNUCDID`, and `DISCOGS` for tracking source metadata across sessions.
- 🎵 **Audio Integration**: Link audio files to your CUE sheet. Automatically extract duration and metadata (performer, title, year, genre) from audio files.
- 📥 **Import Tools**: Support for importing tracklists from **GnuDB**, **1001tracklists**, **Discogs**, and **Audacity**. The GnuDB import features a customized internal browser, while the Audacity import supports high-precision timing labels.
- 🖥️ **Cross-Platform**: Runs on Windows, Mac, and Linux (via Electron).

## Quick Start
1. **Open a File**: Drag and drop or select your `.cue` file.
2. **Edit**: Modify track titles, performers, and timestamps directly in the grid.
3. **Save**: Hit save to overwrite or create a new CUE file.

## Documentation
For more detailed information, please refer to our documentation:

- 📖 **[User Guide](docs/USER_GUIDE.md)** - How to use the application.
- 🛠️ **[Technical Documentation](docs/TECHNICAL.md)** - Architecture, setup, and contribution guide.

## Development

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

### Setup
```bash
npm install
npm run dev
```

---
*Built with ❤️ by NiZDesign*
