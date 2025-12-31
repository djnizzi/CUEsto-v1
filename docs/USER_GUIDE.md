# CUEsto User Guide

## Introduction
CUEsto is a dedicated tool for creating and editing CUE sheets with ease. Whether you need to fix track timings, update metadata, or create a sheet from scratch, CUEsto provides a streamlined interface to get the job done.

## Features
- **Visual Editor**: See your tracks in a clear, table-like layout.
- **Smart Time Editing**: Automatically recalculates durations when you edit start times.
- **Metadata Management**: Easily update Album Title, Performer, File references, and more.
- **Dark Mode**: A sleek, dark interface designed for focus.

## Getting Started

### Opening a CUE Sheet
1. Launch CUEsto.
2. Click the **"Open File"** button in the header (folder icon) or use the "Open" button if available in the metadata section.
3. Select your `.cue` file.
4. The editor will populate with the tracks and metadata from your file.

### Importing from 1001tracklists
CUEsto allows you to import tracklist data directly from a saved **1001tracklists.com** page.
1. Visit a tracklist page on [1001tracklists.com](https://www.1001tracklists.com/).
2. Save the page as an HTML file (`Right Click` -> `Save As...` -> `Webpage, HTML Only`).
3. In CUEsto, click **"import from 1001tracklists"**.
4. Select the saved HTML file.
5. The grid will automatically populate with metadata and tracks.

### Importing from GnuDB
You can quickly retrieve high-quality metadata from the **GnuDB** database using a CD ID.
1. In CUEsto, click **"import from gnudb"**.
2. A modal window will appear. Enter the **GnuDB CD ID** (e.g., `860a8c86`).
3. Click **"get metadata"**.
4. CUEsto will fetch the Artist, Album Title, Year, Genre, and Track Timings directly into the editor.

### Editing Tracks
- **Title/Performer**: Click directly on the text fields to edit the track title or performer.
- **Start Time**: Edit the start time of a track. The duration of the previous track will be automatically recalculated (conceptually), or the track will simply move in timeline.
- **Duration**: You can also edit the duration of a specific track. Note that changing a track's duration will shift the start times of all subsequent tracks to maintain continuity.
- **Add/Remove**: Use the **"Add Row"** button at the bottom to add a new track. Click the trash icon next to a track to remove it.

### Saving
When you are happy with your changes, click the **"Save"** button at the bottom right. A confirmation message will appear confirming that your file has been saved.

## Tips
- **Time Format**: Times are displayed in `MM:SS:FF` (Frames). CUE sheets use 75 frames per second.
- **File Reference**: Ensure the "File" field matches the actual audio file name (e.g., `mix.mp3`) so players can find the audio.
