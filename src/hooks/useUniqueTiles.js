import { useEffect, useState } from 'react';
import { computeUniqueTileSummary } from '../utils/tiles';

export function useUniqueTiles(rectangles) {
    const [summary, setSummary] = useState({ total: 0, perZoom: {}, aborted: false });
    const [computing, setComputing] = useState(false);

    useEffect(() => {
        if (!rectangles.length) {
            setSummary({ total: 0, perZoom: {}, aborted: false });
            return;
        }
        setComputing(true);
        const handle = setTimeout(() => {
            const s = computeUniqueTileSummary(rectangles);
            setSummary(s);
            setComputing(false);
        }, 15);
        return () => clearTimeout(handle);
    }, [rectangles]);

    return { summary, computing };
}
