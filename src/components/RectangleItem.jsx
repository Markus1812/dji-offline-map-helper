import { computeTileCounts } from '../utils/tiles';

export function RectangleItem({ rect, zoomToRectangle, updateRectangle }) {
    const tileCounts = computeTileCounts(rect.bounds, rect.minZoom ?? 1, rect.maxZoom ?? 17);
    const totalTiles = tileCounts.reduce((a, b) => a + b.count, 0);

    return (
        <details key={rect.id} className="rectangle-item">
            <summary
                className="rectangle-summary"
                title="Toggle details"
                style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}
            >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                    <span style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className="rectangle-click-indicator" aria-hidden="true">🗺️</span>{rect.name}
                    </span>
                    <button
                        type="button"
                        className="zoom-inline-btn"
                        title="Zoom to rectangle"
                        onClick={e => { e.stopPropagation(); e.preventDefault(); zoomToRectangle(rect); }}
                        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); e.preventDefault(); zoomToRectangle(rect); } }}
                    >Zoom</button>
                </div>
                <small style={{ color: '#555' }}>
                    {rect.bounds.getNorth().toFixed(4)}, {rect.bounds.getWest().toFixed(4)} → {rect.bounds.getSouth().toFixed(4)}, {rect.bounds.getEast().toFixed(4)}
                </small>
                <small style={{ color: '#777' }}>Zoom {rect.minZoom ?? 1} - {rect.maxZoom ?? 17} | Tiles: {totalTiles}</small>
            </summary>
            <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 600 }}>Name</label>
                    <input
                        type="text"
                        className="map-input"
                        value={rect.name}
                        onChange={e => updateRectangle(rect.id, { name: e.target.value || 'Unnamed' })}
                        style={{ padding: '4px 6px', fontSize: '12px', border: '1px solid #bbb', borderRadius: '4px' }}
                    />
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '11px', fontWeight: 600 }}>Min Zoom</label>
                        <input
                            type="number"
                            className="map-input"
                            min={0}
                            max={22}
                            value={rect.minZoom ?? 1}
                            onChange={e => {
                                const v = parseInt(e.target.value, 10);
                                if (Number.isNaN(v) || v < 0) return;
                                const newMin = v;
                                const newMax = (rect.maxZoom ?? 17) < newMin ? newMin : (rect.maxZoom ?? 17);
                                updateRectangle(rect.id, { minZoom: newMin, maxZoom: newMax });
                            }}
                            style={{ padding: '4px 6px', fontSize: '12px', border: '1px solid #bbb', borderRadius: '4px' }}
                        />
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '11px', fontWeight: 600 }}>Max Zoom</label>
                        <input
                            type="number"
                            className="map-input"
                            min={0}
                            max={22}
                            value={rect.maxZoom ?? 17}
                            onChange={e => {
                                const v = parseInt(e.target.value, 10);
                                if (Number.isNaN(v) || v < 0) return;
                                const newMax = v;
                                const newMin = (rect.minZoom ?? 1) > newMax ? newMax : (rect.minZoom ?? 1);
                                updateRectangle(rect.id, { minZoom: newMin, maxZoom: newMax });
                            }}
                            style={{ padding: '4px 6px', fontSize: '12px', border: '1px solid #bbb', borderRadius: '4px' }}
                        />
                    </div>
                </div>
                <div style={{ marginTop: '4px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                        <thead>
                            <tr style={{ textAlign: 'left' }}>
                                <th style={{ borderBottom: '1px solid #ccc', padding: '2px 4px' }}>Z</th>
                                <th style={{ borderBottom: '1px solid #ccc', padding: '2px 4px' }}>Tiles</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tileCounts.filter(tc => tc.count > 1).map(tc => (
                                <tr key={tc.z}>
                                    <td style={{ padding: '2px 4px' }}>{tc.z}</td>
                                    <td style={{ padding: '2px 4px' }}>{tc.count}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td style={{ padding: '2px 4px', fontWeight: 'bold' }}>Σ</td>
                                <td style={{ padding: '2px 4px', fontWeight: 'bold' }}>{totalTiles}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </details>
    );
}
