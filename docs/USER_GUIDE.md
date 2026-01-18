# CUEsto User Guide

## Introduction
CUEsto is a dedicated tool for creating and editing CUE sheets with ease. Whether you need to fix track timings, update metadata, or create a sheet from scratch, CUEsto provides a streamlined interface to get the job done.

## Features
- **Visual Editor**: See your tracks in a clear, table-like layout.
- **Smart Time Editing**: Automatically recalculates durations when you edit start times.
- **Metadata Management**: Easily update Album Title, Performer, File references, and more.
- **Audio Integration**: Automatically extract duration and metadata tags (title, artist, year, genre) from your audio files. Full support for multiple artists (separated by `; `).
- **Audio Splitting**: Slice large mix files into individual tracks using the bundled FFmpeg engine.
- **Improved Browser**: Customized internal search browser for GnuDB with navigation controls (Back/Forward) and right-click support.
- **CUE Viewer**: Inspect your raw CUE sheet with built-in syntax highlighting in a separate window.
- **Custom Modals**: A fully branded modal system replaces standard OS dialogs for a cohesive, premium experience.
- **Dark Mode**: A sleek, dark interface designed for focus.

## Getting Started

### Opening a CUE Sheet
1. Launch CUEsto.
2. Click the **"Open File"** icon in the header to select an existing `.cue` file.
3. The editor will populate with the tracks and metadata from your file.

### Linking an Audio File
Linking an audio file to your CUE sheet allows CUEsto to provide more accurate information.
1. Click the **Disc Icon** next to the "file name" field in the header.
2. Select your audio file (MP3, WAV, FLAC, etc.).
3. CUEsto will:
   - Extract and populate the **Title**, **Performer**, **Date**, and **Genre** from the file's metadata tags.
   - **Multi-Artist Support**: If the file contains multiple artists or album artists, they are automatically detected and joined with `; ` in the editor.
   - Display the precise **Total Duration** of the audio file.
   - Automatically calculate the duration of the **Final Track**.
   - Suggest the audio filename as the default when saving.

### Importing from 1001tracklists
CUEsto allows you to import tracklist data directly from a saved **1001tracklists.com** page.
1. Visit a tracklist page on [1001tracklists.com](https://www.1001tracklists.com/).
2. Save the page as an HTML file (`Right Click` -> `Save As...` -> `Webpage, HTML Only`).
3. In CUEsto, click the **1001tracklists** logo.
4. Select the saved HTML file.
5. The grid will automatically populate with metadata and tracks.

### Importing from GnuDB
You can quickly retrieve high-quality metadata from the **GnuDB** database using a CD ID.
1. In CUEsto, click the **GnuDB** logo.
2. A modal window will appear.
3. **Redirection Information**: The modal includes a link to GnuDB's search page to help you find the correct CD ID. Clicking this link opens a **Custom Internal Browser** with:
   - **Navigation Controls**: Use the Back and Forward icons to browse GnuDB just like a standard browser.
   - **Right-Click Actions**: Right-click any link to quickly **Copy Link** or **Open in New Window**.
4. **Selective Overwrite**: Before fetching, you can use the checkboxes to choose exactly which fields to update:
   - **Header**: Artist, Album Title, Year, Genre.
   - **Track Titles**: Updates titles for all tracks.
   - **Track Performers**: Updates performers for all tracks.
   - **Start Times/Durations**: Updates indices/timings.
5. **Auto-Fallback**: If a field in your CUE sheet is currently empty, GnuDB will always populate it regardless of your checkbox selections. Your choices only determine whether to *overwrite* existing non-empty values.
6. Enter the **GnuDB CD ID** (e.g., `860a8c86`) and click the **get metadata** icon.
7. CUEsto will fetch the requested metadata directly into the editor.
8. **Persistence**: When you import from GnuDB, CUEsto automatically saves the CD ID as a `REM GNUCDID` line in your CUE file. This allows the application to remember where the metadata came from if you reopen the file later.

### Importing from Discogs
CUEsto provides a powerful integration with **Discogs**, the premier music database. 
1. In CUEsto, click the **Discogs** logo.
2. **Release Code**: Enter the numeric release ID (e.g., `153184`). CUEsto also accepts common formats like `r153184` or `[r153184]`.
3. **Disc # (Optional)**: For multi-disc releases, you can specify which disc to import (e.g., `1` or `2`). If left empty, the first disc's tracks are usually imported.
4. **Selective Overwrite**: Choose exactly what you want to import:
   - **Header**: Artist, Album Title, Year, Genre.
   - **Track Titles**: Updates titles for all imported tracks.
   - **Track Performers**: Updates performers for all imported tracks.
   - **Start Times/Durations**: Updates indices/timings using the raw durations from Discogs.
   - **Interpolate Start Times/Durations**: (Requires a linked audio file) This advanced feature uses your audio file's total length to adjust the Discogs track durations, providing a higher-precision estimate of track start times.
5. **Persistence**: When you import from Discogs, CUEsto automatically saves the release ID as a `REM DISCOGS` line in your CUE file.

### Importing from Audacity
CUEsto supports importing timing and label data from **Audacity Labels** files.
1. In Audacity, ensure your labels are set up (`Tracks` -> `Add New` -> `Label Track`).
2. Export your labels (`File` -> `Export` -> `Export Labels...`) as a `.txt` file.
3. In CUEsto, click the **Audacity** logo.
4. Select the exported `.txt` file.
5. **Conditional Update**:
   - **Start Times**: All track timings are unconditionally updated from the Audacity file.
   - **Titles/Performers**: These are only updated if the current fields in CUEsto are empty. This allows you to re-sync timings from Audacity without losing any manual track naming corrections you've made in the editor.

### Splitting Audio
CUEsto includes a built-in audio splitting engine based on FFmpeg. You can slice a single large audio file into individual tracks based on your CUE sheet.
1. **Link the Audio File**: Follow the steps in the [Linking an Audio File](#linking-an-audio-file) section.
2. **Review Timings**: Ensure your track start times and durations are correct in the grid.
3. **Click Split**: Click the **Scissors** icon at the bottom right of the editor.
4. **Monitor Progress**: A dedicated modal will appear showing the progress of each track being created.
5. **Direct Output**: Tracks are saved in the same directory as the source file using the naming convention: `Track## - Title.ext`.
6. **Actions**: Once complete, you can click the **Open Folder** icon to jump directly to your new files in Windows Explorer.

### Editing Tracks
- **Title/Performer**: Click directly on the text fields to edit the track title or performer.
- **Start Time**: Edit the start time of a track. The duration of the previous track will be automatically recalculated.
- **Duration**: You can edit the duration of a track. Changing a track's duration will shift the start times of all subsequent tracks to maintain continuity.
- **Final Track Duration**: 
  - If an audio file is linked, the duration of the final track is calculated automatically.
  - If a `REM TOTAL DURATION` line is present in the CUE file, CUEsto will use it to display the total length and final track duration even without the audio file.
  - **Smart Visibility**: If neither an audio file nor a duration tag is available, the duration field for the final track is hidden to prevent confusion.
- **Add/Remove/Clear**: 
  - Click the **add row** icon to add a new track.
  - Click the **trash icon** to remove a specific track.
  - Click the **clear** icon to reset the entire cue sheet. A confirmation modal will appear to prevent accidental data loss.

### Viewing the Raw CUE Sheet
If you want to inspect or verify the raw CUE sheet text before saving:
1. Click the **"view cue"** icon at the bottom of the editor.
2. A new read-only window will open displaying the formatted CUE content.
3. **Syntax Highlighting**: The viewer uses specific colors to help you identify CUE commands:
   - **Green**: Metadata comments (`REM` lines).
   - **Red**: Track definitions (`TRACK`).
   - **Magenta**: Timing indices (`INDEX`).
   - **Cyan**: Artist information (`PERFORMER`).
   - **Yellow**: Track and Album titles (`TITLE`).
   - **Blue**: File references (`FILE`).

## Tips
- **Time Format**: Times are displayed in `MM:SS:FF` (Frames). CUE sheets use 75 frames per second.
- **File Reference**: Ensure the "File" field matches the actual audio file name (e.g., `mix.mp3`) so players can find the audio.
