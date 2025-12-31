import { CueTrack } from './cueParser';

export interface GnuDbResult {
    artist: string;
    album: string;
    year?: string;
    genre?: string;
    tracks: CueTrack[];
}

export async function fetchGnuDbMetadata(gnucdid: string): Promise<GnuDbResult | null> {
    try {
        if ((window as any).ipcRenderer) {
            const response = await (window as any).ipcRenderer.invoke('gnudb:fetchMetadata', gnucdid);

            if (response.error) {
                console.error('GnuDB IPC Error:', response.error);
                return null;
            }

            if (response.result) {
                // Return the already parsed result from the main process
                return response.result;
            }
        } else {
            console.error('IPC Renderer not available');
            return null;
        }
    } catch (e) {
        console.error('Failed to fetch GnuDB metadata via IPC:', e);
        return null;
    }
    return null;
}
