import { fireEvent, render, screen } from '@testing-library/react';
import L from 'leaflet';
import { describe, expect, it, vi } from 'vitest';
import { RectangleItem } from './RectangleItem';

function makeRect(id) {
    return {
        id,
        name: 'Rect ' + id,
        bounds: L.latLngBounds([0, 0], [1, 1]),
        minZoom: 2,
        maxZoom: 3
    };
}

describe('RectangleItem', () => {
    it('renders name and zoom info', () => {
        const rect = makeRect(1);
        render(<RectangleItem rect={rect} zoomToRectangle={() => { }} updateRectangle={() => { }} />);
        expect(screen.getByText(/Rect 1/)).toBeInTheDocument();
        expect(screen.getByText(/Zoom 2 - 3/)).toBeInTheDocument();
    });

    it('calls zoomToRectangle on zoom button click', () => {
        const rect = makeRect(2);
        const zoom = vi.fn();
        render(<RectangleItem rect={rect} zoomToRectangle={zoom} updateRectangle={() => { }} />);
        fireEvent.click(screen.getByRole('button', { name: /Zoom/ }));
        expect(zoom).toHaveBeenCalled();
    });
});
