import { TILE_DANGER_THRESHOLD, TILE_WARNING_THRESHOLD } from '../constants/map';

export function UniqueTilesSummary({ summary, computing }) {
    if (!summary) return null;
    return (
        <div style={{
            border: '1px solid #ddd',
            padding: '8px 10px',
            borderRadius: '6px',
            marginBottom: '10px',
            background: '#fafafa'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                <strong style={{ fontSize: '13px' }}>Unique Tiles (all rectangles)</strong>
                <span style={{ fontSize: '11px', color: '#555' }}>{computing ? 'Computing…' : 'Auto'}</span>
            </div>
            {!computing && summary.aborted && (
                <div style={{ fontSize: '11px', color: '#a00', marginTop: '6px' }}>
                    Too large to enumerate exactly ({'>'}{summary.limit.toLocaleString()} tiles potential). Narrow areas or zoom range.
                </div>
            )}
            {!computing && !summary.aborted && (
                <div style={{ marginTop: '6px', fontSize: '11px' }}>
                    Total: <strong>{summary.total.toLocaleString()}</strong>
                    {summary.total > 0 && (
                        <>
                            {summary.total >= TILE_DANGER_THRESHOLD && (
                                <span style={{ marginLeft: 6, color: '#b30000', fontWeight: 600 }}>High risk: may crash DJI Fly</span>
                            )}
                            {summary.total >= TILE_WARNING_THRESHOLD && summary.total < TILE_DANGER_THRESHOLD && (
                                <span style={{ marginLeft: 6, color: '#b34700', fontWeight: 600 }}>Warning: very large</span>
                            )}
                        </>
                    )}
                    {Object.keys(summary.perZoom).length > 0 && (
                        <details style={{ marginTop: '4px' }}>
                            <summary style={{ cursor: 'pointer' }}>Per zoom</summary>
                            <div style={{ marginTop: '4px' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                                    <thead>
                                        <tr style={{ textAlign: 'left' }}>
                                            <th style={{ borderBottom: '1px solid #ccc', padding: '2px 4px' }}>Z</th>
                                            <th style={{ borderBottom: '1px solid #ccc', padding: '2px 4px' }}>Tiles</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Object.keys(summary.perZoom)
                                            .sort((a, b) => Number(a) - Number(b))
                                            .map(z => (
                                                <tr key={z}>
                                                    <td style={{ padding: '2px 4px' }}>{z}</td>
                                                    <td style={{ padding: '2px 4px' }}>{summary.perZoom[z].toLocaleString()}</td>
                                                </tr>
                                            ))}
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <td style={{ padding: '2px 4px', fontWeight: 'bold' }}>Σ</td>
                                            <td style={{ padding: '2px 4px', fontWeight: 'bold' }}>{summary.total.toLocaleString()}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </details>
                    )}
                </div>
            )}
            {!computing && !summary.aborted && (
                <div style={{ marginTop: '8px', fontSize: '10px', lineHeight: 1.3, color: '#555' }}>
                    Guidance: Keep unique tiles ideally &lt; 5k (safe), 5k–10k can become slow, &gt;10k may cause DJI RC/Fly map cache issues or crashes. Reduce area or max zoom if too high.
                </div>
            )}
            {computing && (
                <div style={{ marginTop: '6px', fontSize: '11px', color: '#777' }}>Updating…</div>
            )}
        </div>
    );
}
