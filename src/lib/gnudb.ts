import { CueTrack } from './cueParser';

export interface GnuDbResult {
    id: string;
    artist: string;
    album: string;
    year?: string;
    genre?: string;
    tracks: CueTrack[];
}

export interface OverwriteOptions {
    header: boolean;
    trackTitles: boolean;
    trackPerformers: boolean;
    timings: boolean;
}

export async function fetchGnuDbMetadata(gnucdid: string): Promise<{ result?: GnuDbResult; error?: string } | null> {
    try {
        if ((window as any).ipcRenderer) {
            const response = await (window as any).ipcRenderer.invoke('gnudb:fetchMetadata', gnucdid);

            if (response.error) {
                return { error: response.error };
            }

            if (response.result) {
                return { result: { ...response.result, id: gnucdid.trim() } };
            }
        } else {
            return { error: 'IPC Renderer not available' };
        }
    } catch (e: any) {
        return { error: `Failed to fetch: ${e.message}` };
    }
    return null;
}
