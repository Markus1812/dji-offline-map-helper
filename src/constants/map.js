// Centralized map-related constants
import L from 'leaflet';

export const SIDEBAR_TOTAL_WIDTH = 340; // 300 content + 20 left padding + 20 right padding
export const RECTANGLE_STYLE = { color: 'blue', weight: 2, fillOpacity: 0.2 };
export const EDIT_SELECTED_STYLE = { color: 'red', fillOpacity: 0.6 };
export const REMOVE_SELECTED_STYLE = { color: 'red' };

export const BASE_LAYERS = [
    {
        name: 'OSM Standard',
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: "&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors",
        checked: true
    },
    {
        name: 'OSM Humanitarian',
        url: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
        attribution: '&copy; OpenStreetMap contributors, Tiles style by Humanitarian OpenStreetMap Team hosted by OpenStreetMap France'
    },
    {
        name: 'OpenTopoMap',
        url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
        attribution: 'Map data: &copy; OpenStreetMap contributors, SRTM | Style: &copy; OpenTopoMap (CC-BY-SA)'
    },
    {
        name: 'CartoDB Dark Matter',
        url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
    }
];

export const INITIAL_MAP = L.latLngBounds(
    [34.0, -11.0],
    [72.0, 40.0]
);

export const DJI_CONFIG_PATH_PRIMARY = 'Android/data/dji.go.v5/files/DJI/tiles/config.json';

export const TILE_WARNING_THRESHOLD = 5_000;
export const TILE_DANGER_THRESHOLD = 10_000;
