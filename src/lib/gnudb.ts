import { CueTrack } from './cueParser';

export interface GnuDbResult {
    artist: string;
    album: string;
    year?: string;
    genre?: string;
    tracks: CueTrack[];
}

export async function fetchGnuDbMetadata(gnucdid: string): Promise<{ result?: GnuDbResult; error?: string } | null> {
    try {
        if ((window as any).ipcRenderer) {
            const response = await (window as any).ipcRenderer.invoke('gnudb:fetchMetadata', gnucdid);

            if (response.error) {
                return { error: response.error };
            }

            if (response.result) {
                return { result: response.result };
            }
        } else {
            return { error: 'IPC Renderer not available' };
        }
    } catch (e: any) {
        return { error: `Failed to fetch: ${e.message}` };
    }
    return null;
}
