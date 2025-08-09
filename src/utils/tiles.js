// Tile math & counting utilities
import { TILE_DANGER_THRESHOLD, TILE_WARNING_THRESHOLD } from '../constants/map';

export function lon2tile(lon, z) {
    return ((lon + 180) / 360) * Math.pow(2, z);
}
export function lat2tile(lat, z) {
    const rad = lat * Math.PI / 180;
    return (
        (1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2 * Math.pow(2, z)
    );
}

export function computeTileCounts(bounds, minZoom, maxZoom) {
    if (!bounds) return [];
    const north = bounds.getNorth();
    const south = bounds.getSouth();
    const west = bounds.getWest();
    const east = bounds.getEast();
    const results = [];
    for (let z = minZoom; z <= maxZoom; z++) {
        const xMin = Math.floor(lon2tile(west, z));
        const xMax = Math.floor(lon2tile(east, z));
        const yMin = Math.floor(lat2tile(north, z));
        const yMax = Math.floor(lat2tile(south, z));
        const count = (xMax - xMin + 1) * (yMax - yMin + 1);
        results.push({ z, count });
    }
    return results;
}

// Unique tile summary across rectangles; aborts if too big
export function computeUniqueTileSummary(rectangles, options = {}) {
    const HARD_ITERATION_LIMIT = options.limit || 3_000_000;
    const perZoomRanges = {};
    let theoreticalIterations = 0;
    rectangles.forEach(r => {
        if (!r.bounds) return;
        const north = r.bounds.getNorth();
        const south = r.bounds.getSouth();
        const west = r.bounds.getWest();
        const east = r.bounds.getEast();
        const minZ = r.minZoom ?? 1;
        const maxZ = r.maxZoom ?? 17;
        for (let z = minZ; z <= maxZ; z++) {
            const xMin = Math.floor(lon2tile(west, z));
            const xMax = Math.floor(lon2tile(east, z));
            const yMin = Math.floor(lat2tile(north, z));
            const yMax = Math.floor(lat2tile(south, z));
            const rectTiles = (xMax - xMin + 1) * (yMax - yMin + 1);
            theoreticalIterations += rectTiles;
            if (!perZoomRanges[z]) perZoomRanges[z] = [];
            perZoomRanges[z].push({ xMin, xMax, yMin, yMax });
            if (theoreticalIterations > HARD_ITERATION_LIMIT) {
                return;
            }
        }
    });

    if (theoreticalIterations > HARD_ITERATION_LIMIT) {
        return { total: 0, perZoom: {}, aborted: true, theoretical: theoreticalIterations, limit: HARD_ITERATION_LIMIT };
    }

    const perZoomCounts = {};
    let grandTotal = 0;
    Object.keys(perZoomRanges).sort((a, b) => Number(a) - Number(b)).forEach(zKey => {
        const z = Number(zKey);
        const ranges = perZoomRanges[z];
        const seen = new Set();
        for (const rng of ranges) {
            for (let x = rng.xMin; x <= rng.xMax; x++) {
                for (let y = rng.yMin; y <= rng.yMax; y++) {
                    const k = x + ':' + y;
                    if (!seen.has(k)) seen.add(k);
                }
            }
        }
        perZoomCounts[z] = seen.size;
        grandTotal += seen.size;
    });
    return { total: grandTotal, perZoom: perZoomCounts, aborted: false };
}

export function applyTileWarnings(total) {
    if (total >= TILE_DANGER_THRESHOLD) return { level: 'danger', message: 'High risk: may crash DJI Fly' };
    if (total >= TILE_WARNING_THRESHOLD) return { level: 'warn', message: 'Warning: very large' };
    return { level: 'ok', message: '' };
}
