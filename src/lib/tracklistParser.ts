import { CueSheet, CueTrack } from './cueParser';
import { FRAMES_PER_SECOND } from './timeUtils';

interface TracklistTrack {
    title: string;
    artist: string;
    cueSeconds: number; // calculated from input
    isMashup?: boolean;
    subsongs?: TracklistTrack[];
}

export function parse1001Tracklist(htmlContent: string): CueSheet {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');

    // 1. Extract Global Metadata
    let rawPageTitle = doc.querySelector('title')?.textContent || 'Unknown Tracklist';
    // Clean title (remove "1001Tracklists" suffix if present)
    rawPageTitle = rawPageTitle.replace(/ - 1001Tracklists$/i, '').trim();

    let title = rawPageTitle;
    let performer = 'Unknown Artist';

    // Try to split global title by @ (DJs @ Event/Location)
    const titleParts = rawPageTitle.split(/\s+@\s+/);
    if (titleParts.length >= 2) {
        performer = titleParts[0].trim();
        title = titleParts.slice(1).join(' @ ').trim();
    }

    // Metadata from left pane (can override title split if DJ links found)
    const leftPane = doc.getElementById('left');
    let date = '';
    let genre = '';

    if (leftPane) {
        // Date: title="tracklist recording date"
        const dateSpan = leftPane.querySelector('span[title="tracklist recording date"]');
        if (dateSpan && dateSpan.parentElement && dateSpan.parentElement.parentElement) {
            // Usually in a table structure
            const parentTd = dateSpan.parentElement.parentElement.querySelectorAll('td')[1];
            if (parentTd) date = parentTd.textContent?.trim() || '';
        }

        // Genre: id="tl_music_styles"
        const genreTd = leftPane.querySelector('#tl_music_styles');
        if (genreTd) genre = genreTd.textContent?.trim() || '';

        // Check for DJs (Performer) - this is more reliable if available
        const djLinks = Array.from(leftPane.querySelectorAll('a')).filter(a => a.href && a.href.includes('/dj/'));
        if (djLinks.length > 0) {
            performer = djLinks.map(a => a.textContent?.trim()).join(' & ');
        }
    }

    // 2. Extract Tracks
    const trackDivs = doc.querySelectorAll('div.tlpItem');
    const tracks: TracklistTrack[] = [];
    let currentMainTrack: TracklistTrack | null = null;

    console.log(`Parsing 1001tracklist: found ${trackDivs.length} track items`);

    trackDivs.forEach((div, idx) => {
        // Extract basic info
        const trackValueSpan = div.querySelector('span.trackValue');
        if (!trackValueSpan) return;

        const rawTitle = trackValueSpan.textContent || '';
        // Normalize all whitespace (including non-breaking spaces, tabs, etc.) to a single space
        const fullTitle = rawTitle.trim().replace(/\s+/g, ' ');

        // Split by " @ " or " - " for Artist / Title
        // Use a regex that catches @ or - with surrounding whitespace
        // Also catch just "@" or just "-" if no spaces
        const parts = fullTitle.split(/\s*@\s*|\s+-\s+/);
        let artist = '';
        let trackTitle = '';

        if (parts.length >= 2) {
            artist = parts[0].trim();
            trackTitle = parts.slice(1).join(' - ').trim();
        } else {
            // Fallback for cases where separator might be just "@" or just "-" without spaces
            const fallbackParts = fullTitle.split(/[@-]/);
            if (fallbackParts.length >= 2) {
                artist = fallbackParts[0].trim();
                trackTitle = fallbackParts.slice(1).join(' - ').trim();
            } else {
                artist = 'Unknown Artist';
                trackTitle = fullTitle;
            }
        }

        console.log(`Track ${idx + 1}: [${artist}] - [${trackTitle}] (raw: "${fullTitle}")`);

        // Cue Seconds
        let cueSeconds = 0;
        const cueInput = div.querySelector('input[id*="_cue_seconds"]') as HTMLInputElement;
        if (cueInput && cueInput.value) {
            cueSeconds = parseInt(cueInput.value, 10);
        }

        const trackObj: TracklistTrack = {
            title: trackTitle,
            artist: artist,
            cueSeconds: cueSeconds,
            subsongs: []
        };

        // Check for mashup or linked track
        const isMashup = !!div.querySelector('i[title="mashup linked position"]');
        const isLinked = div.classList.contains('con');
        const trackNumSpan = div.querySelector('span[id*="_tracknumber_value"]');
        const isW = trackNumSpan?.textContent?.includes('w/') || false;

        if ((isMashup || isLinked || isW) && currentMainTrack) {
            currentMainTrack.subsongs?.push(trackObj);
        } else {
            currentMainTrack = trackObj;
            tracks.push(currentMainTrack);
        }
    });

    // 3. Convert to CueSheet format
    const cueTracks: CueTrack[] = tracks.map((t, index) => {
        // Flatten subsongs
        const allTitles = [t.title];
        const allPerformers = [t.artist];

        if (t.subsongs && t.subsongs.length > 0) {
            t.subsongs.forEach(sub => {
                allTitles.push(sub.title);
                allPerformers.push(sub.artist);
            });
        }

        const finalTitle = allTitles.join(' / ');
        const finalPerformer = allPerformers.join(' / ');

        const index01 = t.cueSeconds * FRAMES_PER_SECOND;

        return {
            number: index + 1,
            title: finalTitle,
            performer: finalPerformer,
            index01: index01
        };
    });

    return {
        title,
        performer,
        date,
        genre,
        file: `${performer} - ${title}.mp3`,
        tracks: cueTracks
    };
}
