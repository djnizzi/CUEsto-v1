export const FRAMES_PER_SECOND = 75;

/**
 * Converts a time string (MM:SS:FF) to absolute frames.
 * Relaxed parsing: Minutes can be > 99.
 */
export function timeToFrames(timeStr: string): number {
    const parts = timeStr.split(':').map(Number);
    if (parts.some(isNaN)) return 0; // or throw error

    let m = 0, s = 0, f = 0;
    if (parts.length === 3) {
        [m, s, f] = parts;
    } else if (parts.length === 2) {
        [m, s] = parts;
    } else if (parts.length === 1) {
        [s] = parts; // Ambiguous, but assuming seconds if only one number? or Frames? CUE usually MM:SS:FF. Let's assume 00:00:FF if just one number? No, usually MM:SS:FF is strict.
        // For safety, let's treat single number as index (bad idea). 
        // Let's stick to strict 3 parts or 2 parts (MM:SS).
    }

    return (m * 60 * FRAMES_PER_SECOND) + (s * FRAMES_PER_SECOND) + f;
}

/**
 * Converts absolute frames to time string (MM:SS:FF).
 * Ensures FF is always 2 digits, SS is 2 digits.
 * Minutes can be variable length.
 */
export function framesToTime(frames: number): string {
    if (frames < 0) frames = 0;

    const f = frames % FRAMES_PER_SECOND;
    let remainingSeconds = Math.floor(frames / FRAMES_PER_SECOND);
    const s = remainingSeconds % 60;
    const m = Math.floor(remainingSeconds / 60);

    const format = (n: number) => n.toString().padStart(2, '0');

    return `${m}:${format(s)}:${format(f)}`;
}

/**
 * Converts MM:SS or HH:MM:SS to absolute seconds.
 */
export function mmssToSeconds(duration: string): number {
    if (!duration) return 0;
    const parts = duration.split(':').map(Number);
    if (parts.length === 2) {
        return parts[0] * 60 + parts[1];
    } else if (parts.length === 3) {
        return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    return 0;
}

/**
 * Validates if the string is in MM:SS:FF format or M:SS:FF
 */
export function isValidTimeFormat(str: string): boolean {
    return /^\d+:\d{2}:\d{2}$/.test(str);
}
