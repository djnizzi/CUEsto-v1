import { CueTrack } from './cueParser';
import { mmssToSeconds } from './timeUtils';

export interface DiscogsResult {
    artist: string;
    album: string;
    year?: string;
    genre?: string;
    tracks: Array<{
        number: number;
        title: string;
        performer: string;
        duration: string; // MM:SS
        position: string;
    }>;
    releaseCode?: string;
}

export interface DiscogsOptions {
    header: boolean;
    trackTitles: boolean;
    trackPerformers: boolean;
    timings: boolean;
    interpolate: boolean;
    discNumber?: string;
}

export async function fetchDiscogsMetadata(releaseCode: string): Promise<{ result?: DiscogsResult; error?: string } | null> {
    try {
        if ((window as any).ipcRenderer) {
            const response = await (window as any).ipcRenderer.invoke('discogs:fetchMetadata', releaseCode);
            if (response.error) {
                return { error: response.error };
            }
            return { result: response.result };
        } else {
            return { error: 'IPC Renderer not available' };
        }
    } catch (e: any) {
        return { error: `Failed to fetch: ${e.message}` };
    }
}

/**
 * Interpolates Discogs track durations to match the total duration of the local file.
 * Logic ported from functions.py: interpol_realtime
 */
export function interpolateTimings(tracks: any[], totalLengthFrames: number): CueTrack[] {
    const trackDurationsSeconds = tracks.map(t => {
        if (typeof t.duration === 'string') return mmssToSeconds(t.duration);
        if (typeof t.duration === 'number') return t.duration / 75; // assume frames
        return 0;
    });
    const totalDiscogsDurationSeconds = trackDurationsSeconds.reduce((acc, d) => acc + d, 0);

    const totalFileDurationSeconds = totalLengthFrames / 75;
    const ratio = totalDiscogsDurationSeconds > 0 ? totalFileDurationSeconds / totalDiscogsDurationSeconds : 1;

    let currentOffsetFrames = 0;
    return tracks.map((t, i) => {
        const interpolatedDurationSeconds = trackDurationsSeconds[i] * ratio;
        const startOffsetFrames = currentOffsetFrames;
        currentOffsetFrames += Math.round(interpolatedDurationSeconds * 75);

        return {
            number: t.number,
            title: t.title,
            performer: t.performer,
            index01: startOffsetFrames
        };
    });
}

/**
 * Converts raw Discogs tracklist to CueTracks without interpolation.
 */
export function discogsTracksToCueTracks(tracks: DiscogsResult['tracks']): CueTrack[] {
    let currentOffsetFrames = 0;
    return tracks.map(t => {
        const startOffsetFrames = currentOffsetFrames;
        const durationSeconds = mmssToSeconds(t.duration);
        currentOffsetFrames += Math.round(durationSeconds * 75);

        return {
            number: t.number,
            title: t.title,
            performer: t.performer,
            index01: startOffsetFrames
        };
    });
}

