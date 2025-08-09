import L from 'leaflet';
import { describe, expect, it } from 'vitest';
import { applyTileWarnings, computeTileCounts, computeUniqueTileSummary, lat2tile, lon2tile } from './tiles';

function makeBounds(north, west, south, east) {
    return L.latLngBounds([south, west], [north, east]);
}

describe('tile math basics', () => {
    it('lon2tile / lat2tile basic ranges', () => {
        expect(lon2tile(0, 0)).toBeCloseTo(0.5, 5);
        expect(lat2tile(0, 0)).toBeCloseTo(0.5, 5);
        // At zoom 1 world splits into 2 tiles
        expect(Math.floor(lon2tile(0, 1))).toBe(1);
    });

    it('computeTileCounts for 1x1 deg area small zooms', () => {
        const b = makeBounds(1, 0, 0, 1);
        const res = computeTileCounts(b, 0, 2); // zoom 0..2
        expect(res.map(r => r.z)).toEqual([0, 1, 2]);
        res.forEach(r => expect(r.count).toBeGreaterThan(0));
    });
});

describe('computeUniqueTileSummary', () => {
    it('deduplicates overlapping rectangles same zoom', () => {
        const a = { id: 1, bounds: makeBounds(1, 0, 0, 1), minZoom: 2, maxZoom: 2 };
        const b = { id: 2, bounds: makeBounds(1, 0, 0, 1), minZoom: 2, maxZoom: 2 };
        const s = computeUniqueTileSummary([a, b]);
        expect(s.aborted).toBe(false);
        // Each rectangle identical so total equals perZoom count
        expect(Object.keys(s.perZoom)).toEqual(['2']);
        expect(s.total).toBe(s.perZoom[2]);
    });

    it('handles different zoom ranges', () => {
        const a = { id: 1, bounds: makeBounds(1, 0, 0, 1), minZoom: 2, maxZoom: 3 };
        const b = { id: 2, bounds: makeBounds(1, 0, 0, 1), minZoom: 3, maxZoom: 4 }; // overlaps only at z=3
        const s = computeUniqueTileSummary([a, b]);
        expect(s.aborted).toBe(false);
        expect(Object.keys(s.perZoom).map(Number)).toEqual([2, 3, 4]);
        expect(s.perZoom[3]).toBeGreaterThan(0);
    });

    it('aborts on excessive iteration theoretical', () => {
        const rects = [];
        for (let i = 0; i < 20; i++) {
            const west = i * 0.5;
            const east = west + 0.6;
            rects.push({ id: i, bounds: makeBounds(50, west, 49.2, east), minZoom: 8, maxZoom: 12 });
        }
        const s = computeUniqueTileSummary(rects, { limit: 2_000 });
        expect(s.aborted).toBe(true);
        expect(s.total).toBe(0);
    });
});

describe('applyTileWarnings', () => {
    it('ok below warning', () => {
        expect(applyTileWarnings(10_000).level).toBe('ok');
    });
    it('warn in middle range', () => {
        expect(applyTileWarnings(200_000).level).toBe('warn');
    });
    it('danger above danger threshold', () => {
        expect(applyTileWarnings(400_000).level).toBe('danger');
    });
});
