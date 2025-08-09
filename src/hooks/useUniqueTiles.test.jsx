import { act, renderHook } from '@testing-library/react';
import L from 'leaflet';
import { describe, expect, it } from 'vitest';
import { useUniqueTiles } from './useUniqueTiles';

function makeRect(id) {
    return {
        id,
        bounds: L.latLngBounds([0, 0], [1, 1]),
        minZoom: 2,
        maxZoom: 2,
        name: 'R' + id
    };
}

describe('useUniqueTiles', () => {
    it('computes summary after rectangles change', async () => {
        const { result, rerender } = renderHook(({ rects }) => useUniqueTiles(rects), { initialProps: { rects: [] } });
        expect(result.current.summary.total).toBe(0);

        await act(async () => {
            rerender({ rects: [makeRect(1)] });
        });

        // Wait for debounce (15ms) + tick
        await new Promise(r => setTimeout(r, 40));
        expect(result.current.summary.total).toBeGreaterThan(0);
    });
});
