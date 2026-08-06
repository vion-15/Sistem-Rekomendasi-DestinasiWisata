"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";

type LeafletIconDefaultPrototype = typeof L.Icon.Default.prototype & {
    _getIconUrl?: string;
};

delete (L.Icon.Default.prototype as LeafletIconDefaultPrototype)._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const userIcon = new L.Icon({
    iconUrl: '/frontend-images/icon-user.png',
    iconSize: [55, 55],
    iconAnchor: [23, 23],
    popupAnchor: [0, -23],
});

type Destinasi = {
    id: string;
    nama: string;
    kategori: string;
    deskripsi: string;
    latitude: number;
    longitude: number;
    similarity_score: number;
};

interface MapGISProps {
    destinasiList: Destinasi[];
    selectedDest: Destinasi | null;
    onViewDetail: (destinasi: Destinasi) => void;
    userLoc: { lat: number, lng: number } | null;
    routePath: [number, number][] | null;
}

function FitBoundsView({ destinasiList, routePath }: { destinasiList: Destinasi[], routePath: [number, number][] | null }) {
    const map = useMap();

    useEffect(() => {
        if (routePath && routePath.length > 0) {
            const bounds = L.latLngBounds(routePath);
            map.fitBounds(bounds, { padding: [50, 50] });
        } else if (destinasiList && destinasiList.length > 0) {
            const koordinatMarkers = destinasiList.map(dest => [dest.latitude, dest.longitude] as [number, number]);
            const bounds = L.latLngBounds(koordinatMarkers);
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
        }
    }, [destinasiList, routePath, map]);

    return null;
}

export default function MapGIS({ destinasiList, selectedDest, onViewDetail, userLoc, routePath }: MapGISProps) {
    const defaultCenter: [number, number] = [-6.17539240, 106.82715280];

    console.log("MapGIS selectedDest:", selectedDest);

    return (
        <MapContainer center={defaultCenter} zoom={11} className="w-full h-full rounded-2xl z-0">
            <TileLayer
                attribution='© OpenStreetMap © CARTO'
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            />

            <FitBoundsView destinasiList={destinasiList} routePath={routePath} />

            {userLoc && (
                <Marker position={[userLoc.lat, userLoc.lng]} icon={userIcon}>
                    <Popup>
                        <div className="font-bold text-slate-800 text-center">📍 Titik Keberangkatan<br /><span className="text-xs font-normal text-slate-500">Lokasi Anda Saat Ini</span></div>
                    </Popup>
                </Marker>
            )}

            {selectedDest && (
                <Marker
                    position={[
                        selectedDest.latitude,
                        selectedDest.longitude
                    ]}
                >
                    <Popup>
                        <div className="text-center">
                            <h3 className="font-bold">
                                {selectedDest.nama}
                            </h3>

                            <p className="text-xs text-slate-500">
                                {selectedDest.kategori}
                            </p>
                        </div>
                    </Popup>
                </Marker>
            )}

            {destinasiList.map((dest) => (
                <Marker key={dest.id} position={[dest.latitude, dest.longitude]}>
                    <Popup>
                        <div className="text-center w-48">
                            <h3 className="font-bold text-slate-800 text-sm mb-1">{dest.nama}</h3>
                            <p className="text-xs text-slate-500 uppercase mb-2">{dest.kategori}</p>
                            <button
                                onClick={() => onViewDetail(dest)}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 px-3 rounded-lg transition-colors shadow-sm"
                            >
                                Lihat Destinasi & Rute
                            </button>
                        </div>
                    </Popup>
                </Marker>
            ))}

            {routePath && (
                <Polyline
                    positions={routePath}
                    pathOptions={{ color: '#2563eb', weight: 5, opacity: 0.7 }}
                />
            )}
        </MapContainer>
    );
}