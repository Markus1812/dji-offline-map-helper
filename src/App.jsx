
import L from 'leaflet';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet/dist/leaflet.css';
import { useEffect, useRef, useState } from 'react';
import { FeatureGroup, LayersControl, MapContainer, TileLayer, useMap } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import './App.css';
import { RectangleItem } from './components/RectangleItem';
import { UniqueTilesSummary } from './components/UniqueTilesSummary';
import { BASE_LAYERS, DJI_CONFIG_PATH_PRIMARY, EDIT_SELECTED_STYLE, INITIAL_MAP, RECTANGLE_STYLE, REMOVE_SELECTED_STYLE, SIDEBAR_TOTAL_WIDTH } from './constants/map';
import { useUniqueTiles } from './hooks/useUniqueTiles';


function handleCreated(e, setRectangles, featureGroupRef) {
  if (e.layerType !== 'rectangle') return;
  const bounds = e.layer.getBounds();
  const id = Date.now() + Math.random();
  const defaultName = `Rectangle ${Date.now().toString().slice(-4)}`;
  const name = prompt('Enter a name for this rectangle:', defaultName);

  if (name === null) {
    // User cancelled naming -> remove the temp layer
    featureGroupRef.current?.removeLayer(e.layer);
    return;
  }

  const finalName = name || defaultName;
  e.layer._reactLeafletId = id;
  e.layer.bindTooltip(finalName, {
    permanent: true,
    direction: 'center',
    className: 'rectangle-label'
  });

  setRectangles(prev => [
    ...prev,
    { id, bounds, color: 'blue', name: finalName, minZoom: 1, maxZoom: 17 }
  ]);
}

function handleEdited(e, setRectangles) {
  const editedLayers = e.layers;
  setRectangles(prev => {
    const updated = [...prev];
    editedLayers.eachLayer(layer => {
      const id = layer._reactLeafletId;
      if (!id) return;
      const idx = updated.findIndex(r => r.id === id);
      if (idx === -1) return;
      const newBounds = layer.getBounds();
      if (layer.getTooltip()) {
        layer.unbindTooltip();
        layer.bindTooltip(updated[idx].name, { permanent: true, direction: 'center', className: 'rectangle-label' });
      }
      updated[idx] = { ...updated[idx], bounds: newBounds };
    });
    return updated;
  });
}

function handleDeleted(e, setRectangles) {
  const deletedLayers = e.layers;
  const removedIds = [];
  deletedLayers.eachLayer(l => { if (l._reactLeafletId) removedIds.push(l._reactLeafletId); });
  setRectangles(prev => prev.filter(r => !removedIds.includes(r.id)));
}

function App() {
  const [rectangles, setRectangles] = useState([]);
  const featureGroupRef = useRef();
  const fileInputRef = useRef();
  const mapRef = useRef();
  const pendingZoomRef = useRef(null);
  const { summary: uniqueTilesSummary, computing: computingUnique } = useUniqueTiles(rectangles);

  function MapRefSetter() {
    const map = useMap();
    useEffect(() => {
      if (map && mapRef.current !== map) {
        mapRef.current = map;
        if (pendingZoomRef.current) {
          const rect = pendingZoomRef.current;
          pendingZoomRef.current = null;
          setTimeout(() => zoomToRectangle(rect), 30);
        }
      }
    }, [map]);
    return null;
  }

  const zoomToRectangle = rect => {
    if (!rect || !rect.bounds) return;
    const map = mapRef.current;
    if (!map) { pendingZoomRef.current = rect; return; }
    map.invalidateSize();
    let bounds = rect.bounds;
    if (!(bounds instanceof L.LatLngBounds) && bounds?._southWest && bounds?._northEast) {
      bounds = L.latLngBounds(bounds._southWest, bounds._northEast);
    }
    const sidebarEl = document.querySelector('.sidebar');
    const sidebarWidth = sidebarEl ? sidebarEl.offsetWidth : SIDEBAR_TOTAL_WIDTH;
    const paddingTopLeft = [sidebarWidth + 40, 40];
    const paddingBottomRight = [30, 30];
    try { map.fitBounds(bounds, { paddingTopLeft, paddingBottomRight, animate: true }); } catch { map.fitBounds(bounds); }
  };

  // Invalidate size shortly after mount
  useEffect(() => {
    if (mapRef.current) setTimeout(() => mapRef.current?.invalidateSize(), 60);
  }, []);

  const handleExport = () => {
    if (!rectangles.length) {
      alert('No rectangles to export');
      return;
    }
    const payload = rectangles.map(r => {
      const b = r.bounds;
      return {
        latitudeNorth: b.getNorth(),
        latitudeSouth: b.getSouth(),
        longitudeEast: b.getEast(),
        longitudeWest: b.getWest(),
        maxZoom: r.maxZoom ?? 17,
        minZoom: r.minZoom ?? 1,
        name: r.name,
        timestamp: r.timestamp || Date.now()
      };
    });
    const blob = new Blob([JSON.stringify(payload, null, 4)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'config.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => fileInputRef.current?.click();

  // Import helpers
  const isValidImportItem = item => (
    item && typeof item === 'object' &&
    ['latitudeNorth', 'latitudeSouth', 'longitudeEast', 'longitudeWest', 'name']
      .every(k => Object.prototype.hasOwnProperty.call(item, k))
  );

  const createLayerFromItem = (item, featureGroup) => {
    const bounds = L.latLngBounds(
      [item.latitudeSouth, item.longitudeWest],
      [item.latitudeNorth, item.longitudeEast]
    );
    const layer = L.rectangle(bounds, RECTANGLE_STYLE);
    const id = Date.now() + Math.random();
    layer._reactLeafletId = id;
    const name = item.name || `Rectangle ${id}`;
    layer.bindTooltip(name, { permanent: true, direction: 'center', className: 'rectangle-label' });
    layer.addTo(featureGroup);
    return {
      id,
      bounds,
      color: 'blue',
      name,
      timestamp: item.timestamp || Date.now(),
      minZoom: item.minZoom ?? item.minzoom ?? 1,
      maxZoom: item.maxZoom ?? item.maxzoom ?? 17
    };
  };

  const handleFileChange = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (!Array.isArray(data)) throw new Error('JSON root must be an array');
        if (!featureGroupRef.current) return;
        const fg = featureGroupRef.current;
        const newRects = data.filter(isValidImportItem).map(item => createLayerFromItem(item, fg));
        if (newRects.length) {
          setRectangles(prev => [...prev, ...newRects]);
          alert(`Imported ${newRects.length} rectangle(s).`);
        } else {
          alert('No valid rectangles found in file.');
        }
      } catch (err) {
        alert('Failed to import: ' + err.message);
      } finally {
        e.target.value = '';
      }
    };
    reader.readAsText(file);
  };

  // Unique tile recomputation handled by hook

  return (
    <div className="fullscreen-map">
      <div className="sidebar always-open">
        <h3>Offline Maps ({rectangles.length})</h3>
        <div className="actions">
          <button onClick={handleExport} className="action-btn" title="Export config.json">Export</button>
          <button onClick={handleImportClick} className="action-btn" title="Import config.json">Import</button>
          <input ref={fileInputRef} type="file" accept="application/json,.json" style={{ display: 'none' }} onChange={handleFileChange} />
        </div>
        <div style={{ fontSize: '12px', lineHeight: 1.4, color: '#444', marginBottom: '10px' }}>
          <strong>DJI Offline Map Helper</strong><br />
          Import the <code>config.json</code> from your DJI controller, inspect or extend the offline map areas, then export a new file to load back onto the device.
          <div style={{ marginTop: '6px' }}>
            Tested with <em>DJI Mini 3 + DJI RC</em>. Other DJI models may use a similar format (no guarantee).
          </div>
        </div>
        <div className="rectangle-list">
          <UniqueTilesSummary summary={uniqueTilesSummary} computing={computingUnique} />
          {rectangles.map(rect => {
            const updateRectangle = (id, changes) => {
              setRectangles(prev => prev.map(r => r.id === id ? { ...r, ...changes } : r));
              if (changes.name && featureGroupRef.current) {
                featureGroupRef.current.eachLayer(layer => {
                  if (layer._reactLeafletId === id) {
                    if (layer.getTooltip()) layer.unbindTooltip();
                    layer.bindTooltip(changes.name, { permanent: true, direction: 'center', className: 'rectangle-label' });
                  }
                });
              }
            };
            return <RectangleItem key={rect.id} rect={rect} zoomToRectangle={zoomToRectangle} updateRectangle={updateRectangle} />;
          })}
          {rectangles.length === 0 && <div className="no-rectangles">No rectangles created yet</div>}
        </div>
        <details style={{ marginTop: '10px', fontSize: '12px' }}>
          <summary style={{ cursor: 'pointer', fontWeight: 600 }}>How to use</summary>
          <ol style={{ paddingLeft: '18px', margin: '6px 0' }}>
            <li>Click <strong>Import</strong> and choose your DJI <code>config.json</code>.</li>
            <li>Use the blue rectangle tool (top-right of map) to draw new offline map areas.</li>
            <li>Name each rectangle when prompted (blank = default name).</li>
            <li>Click a rectangle entry below to zoom to it.</li>
            <li>Use the edit/delete controls to adjust existing areas.</li>
            <li>Press <strong>Export</strong> to download the updated <code>config.json</code>.</li>
          </ol>
        </details>
        <details style={{ marginTop: '8px', fontSize: '12px' }}>
          <summary style={{ cursor: 'pointer', fontWeight: 600 }}>Notes</summary>
          <ul style={{ paddingLeft: '18px', margin: '6px 0' }}>
            <li>All data stays in your browser (no upload).</li>
            <li>Large areas mean bigger downloads on the controller.</li>
            <li>Zoom padding accounts for the sidebar so rectangles fit cleanly.</li>
            <li>Controller config.json path: <code>{DJI_CONFIG_PATH_PRIMARY}</code></li>
            <li>After editing: replace the file on the SD/internal storage and reboot / relaunch the DJI app for changes.</li>
          </ul>
        </details>
        <div style={{ marginTop: '14px', fontSize: '11px', color: '#666', borderTop: '1px solid #eee', paddingTop: '8px' }}>
          Tip: Switch base layers (top-left) to verify terrain / contrast before exporting.
        </div>
      </div>
      <MapContainer
        center={[54, 15]} // Fallback center (rough center of Europe)
        zoom={4}          // Wide zoom to show most of Europe if fitBounds not yet applied
        className="map-area"
        style={{
          height: '100vh',
          width: `calc(100vw - ${SIDEBAR_TOTAL_WIDTH}px)`,
          marginLeft: `${SIDEBAR_TOTAL_WIDTH}px`
        }}
        whenCreated={mapInstance => {
          mapRef.current = mapInstance;
          // After initial size invalidation, fit to Europe with sidebar padding
          setTimeout(() => {
            mapInstance.invalidateSize();
            try {
              const sidebarWidth = SIDEBAR_TOTAL_WIDTH;
              mapInstance.fitBounds(INITIAL_MAP, {
                paddingTopLeft: [sidebarWidth + 40, 40],
                paddingBottomRight: [30, 30]
              });
            } catch { /* ignore fit errors */ }
          }, 60);
        }}
      >
        <MapRefSetter />
        <LayersControl position="topleft">
          {BASE_LAYERS.map(layer => (
            <LayersControl.BaseLayer
              key={layer.name}
              name={layer.name}
              checked={!!layer.checked}
            >
              <TileLayer url={layer.url} attribution={layer.attribution} />
            </LayersControl.BaseLayer>
          ))}
          <LayersControl.Overlay checked name="Rectangles">
            <FeatureGroup ref={featureGroupRef}>
              <EditControl
                position="topright"
                onCreated={e => handleCreated(e, setRectangles, featureGroupRef)}
                onEdited={e => handleEdited(e, setRectangles)}
                onDeleted={e => handleDeleted(e, setRectangles)}
                draw={{
                  rectangle: { shapeOptions: RECTANGLE_STYLE, showArea: false, metric: false, repeatMode: false },
                  polyline: false,
                  polygon: false,
                  circle: false,
                  marker: false,
                  circlemarker: false,
                }}
                edit={{
                  edit: { selectedPathOptions: EDIT_SELECTED_STYLE },
                  remove: { selectedPathOptions: REMOVE_SELECTED_STYLE }
                }}
              />
            </FeatureGroup>
          </LayersControl.Overlay>
        </LayersControl>
      </MapContainer>
    </div>
  );
}

export default App;
