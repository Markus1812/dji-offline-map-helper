import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { UniqueTilesSummary } from './UniqueTilesSummary';

describe('UniqueTilesSummary', () => {
    it('renders total and per zoom rows', () => {
        render(<UniqueTilesSummary computing={false} summary={{ total: 1234, perZoom: { 5: 100, 6: 200 }, aborted: false }} />);
        expect(screen.getByText(/Unique Tiles/)).toBeInTheDocument();
        // total formatted could be 1,234 or 1.234 depending on locale
        const totalElement = screen.getAllByText(/1[.,]234/)[0];
        expect(totalElement).toBeInTheDocument();
        expect(screen.getByText('5')).toBeInTheDocument();
        expect(screen.getByText('100')).toBeInTheDocument();
    });

    it('shows aborted message', () => {
        render(<UniqueTilesSummary computing={false} summary={{ total: 0, perZoom: {}, aborted: true, limit: 9999 }} />);
        expect(screen.getByText(/Too large to enumerate/)).toBeInTheDocument();
    });
});
