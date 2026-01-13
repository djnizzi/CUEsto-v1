import { CueTrack, CueSheet } from './cueParser';

export interface MusicBrainzResult {
    disc: {
        offset: number[];
        sectors: number;
        id: string;
    };
    release: any;
}

/**
 * Transforms MusicBrainz DiscID lookup data into a Partial<CueSheet>
 * Normalizes offsets so the first track starts at 00:00:00 (0 frames)
 */
export function musicbrainzToCue(data: MusicBrainzResult): Partial<CueSheet> {
    const { disc, release } = data;

    // Extract basic metadata
    const artist = release['artist-credit']?.map((a: any) => a.name).join(', ') || 'Unknown Artist';
    const album = release.title || 'Unknown Album';
    const year = release.date?.substring(0, 4) || '';

    // Extract new metadata
    const barcode = release.barcode || '';
    const labelInfo = release['label-info']?.[0];
    const label = labelInfo?.label?.name || '';
    const catalog = labelInfo?.['catalog-number'] || '';

    // Try to find a primary genre/type
    const genre = release['release-group']?.['primary-type'] || '';

    const tracks: CueTrack[] = [];

    // Find the correct medium that matches the disc ID
    const targetDiscId = disc.id;
    const medium = release.media?.find((m: any) =>
        m.discs?.some((d: any) => d.id === targetDiscId)
    ) || release.media?.[0];

    if (medium && medium.tracks) {
        // MusicBrainz offsets are usually absolute sectors from CD start (often starting at 150).
        // CUEsheets typically start at 0.
        const firstOffset = disc.offset && disc.offset.length > 0 ? disc.offset[0] : 0;

        medium.tracks.forEach((t: any, i: number) => {
            const tArtist = t['artist-credit']?.map((a: any) => a.name).join(', ') || artist;

            // Calculate start index in frames (sectors)
            let index01 = 0;
            if (disc.offset && disc.offset[i] !== undefined) {
                index01 = disc.offset[i] - firstOffset;
            } else {
                // Fallback calculation using track lengths if offsets are missing for some reason
                if (i > 0 && tracks[i - 1]) {
                    const prevTrack = tracks[i - 1];
                    const prevMbTrack = medium.tracks[i - 1];
                    const prevLenMs = prevMbTrack.length || 0;
                    index01 = prevTrack.index01 + Math.round((prevLenMs / 1000) * 75);
                }
            }

            tracks.push({
                number: i + 1,
                title: t.title || 'Untitled',
                performer: tArtist,
                index01: Math.max(0, index01)
            });
        });
    }

    return {
        performer: artist,
        title: album,
        date: year,
        genre: genre,
        tracks,
        mb_discid: disc.id,
        barcode,
        label,
        catalog
    };
}

export async function fetchMusicBrainzMetadata(discId: string): Promise<{ result?: MusicBrainzResult, error?: string }> {
    if ((window as any).ipcRenderer) {
        return await (window as any).ipcRenderer.invoke('musicbrainz:fetchMetadata', discId);
    }
    return { error: 'IPC renderer not available' };
}
