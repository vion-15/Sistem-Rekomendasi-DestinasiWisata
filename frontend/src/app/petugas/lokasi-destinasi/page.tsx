"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { ArrowLeft, Info } from "lucide-react";

// Import MapGIS tanpa SSR
const MapGIS = dynamic(() => import("@/components/MapGIS"), {
    ssr: false,
    loading: () => (
        <div className="flex items-center justify-center h-full w-full bg-slate-100 text-slate-500">
            Memuat Peta...
        </div>
    )
});

interface DestinasiMap {
    id: string;
    nama: string;
    kategori: string;
    deskripsi: string;
    latitude: number;
    longitude: number;
    similarity_score: number;
}

type RouteInfo = { distanceKm: string; durationMin: string } | null;

export default function LokasiDestinasiPage() {
    const router = useRouter();

    const [activeTab, setActiveTab] = useState<"aktivitas" | "monitoring">("aktivitas");
    const [isCardOpen, setIsCardOpen] = useState(true);

    const [selectedDest, setSelectedDest] = useState<DestinasiMap | null>(null);
    const [userLoc, setUserLoc] = useState<{ lat: number, lng: number } | null>(null);
    const [routeInfo, setRouteInfo] = useState<RouteInfo>(null);
    const [routePath, setRoutePath] = useState<[number, number][] | null>(null);
    const [isLoadingRoute, setIsLoadingRoute] = useState(false);

    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                (err) => console.warn("Akses lokasi ditolak:", err.message)
            );
        }

        const savedDest = localStorage.getItem("route_destination");
        if (savedDest) {
            const rawData = JSON.parse(savedDest);
            const strictDest: DestinasiMap = {
                id: rawData.id || "0",
                nama: rawData.nama || "Destinasi Wisata",
                kategori: rawData.kategori || "-",
                deskripsi: rawData.deskripsi || "-",
                latitude: Number(rawData.latitude) || 0,
                longitude: Number(rawData.longitude) || 0,
                similarity_score: Number(rawData.similarity_score) || 0,
            };
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setSelectedDest(strictDest);
        }
    }, []);

    useEffect(() => {
        if (!selectedDest || !userLoc) return;

        const loadRoute = async () => {
            setIsLoadingRoute(true);
            try {
                const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${userLoc.lng},${userLoc.lat};${selectedDest.longitude},${selectedDest.latitude}?alternatives=true&overview=full&geometries=geojson`;
                const routeRes = await fetch(osrmUrl);
                const routeData = await routeRes.json();

                if (routeData.code === "Ok" && routeData.routes.length > 0) {
                    const route = routeData.routes[0];
                    setRouteInfo({
                        distanceKm: (route.distance / 1000).toFixed(1),
                        durationMin: Math.round(route.duration / 60).toString(),
                    });
                    const coordinates = route.geometry.coordinates.map(
                        (coord: number[]) => [coord[1], coord[0]] as [number, number]
                    );
                    setRoutePath(coordinates);
                }
            } catch (err) {
                console.error("Gagal mengambil data rute", err);
            } finally {
                setIsLoadingRoute(false);
            }
        };
        loadRoute();
    }, [selectedDest, userLoc]);

    const handleCloseCard = () => setIsCardOpen(false);

    return (
        <div className="relative w-[calc(100%+3rem)] h-[calc(100vh-72px)] -m-6 overflow-hidden bg-slate-100 z-0 flex flex-col [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {/* BACKGROUND: Peta */}

            <MapGIS
                key="peta-lokasi-destinasi"
                destinasiList={selectedDest ? [selectedDest] : []}
                selectedDest={selectedDest}
                onViewDetail={() => { }}
                userLoc={userLoc}
                routePath={routePath}
            />

            {/* TOMBOL BUKA CARD (Tab Aktivitas) */}
            {!isCardOpen && activeTab === "aktivitas" && (
                <button
                    onClick={() => setIsCardOpen(true)}
                    className="absolute top-4 left-6 z-10 flex items-center gap-2 bg-white/95 backdrop-blur-md px-4 py-3 rounded-xl shadow-lg border border-slate-200 text-slate-700 hover:text-blue-600 font-bold transition-all"
                >
                    <Info size={20} />
                    Lihat Info Destinasi
                </button>
            )}

            {/* FLOATING PANEL KIRI (Tab Aktivitas) */}
            {isCardOpen && activeTab === "aktivitas" && (
                <div className="absolute top-4 left-6 bottom-4 z-10 w-80 md:w-[26rem] flex flex-col animate-in slide-in-from-left-8 duration-300">
                    <div className="bg-white/95 backdrop-blur-md p-6 rounded-2xl shadow-2xl border border-slate-200 flex flex-col h-full overflow-hidden">

                        <div className="flex items-center gap-3 mb-6 shrink-0 border-b border-slate-100 pb-4">
                            <button
                                onClick={handleCloseCard}
                                className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-600"
                            >
                                <ArrowLeft size={20} />
                            </button>
                            <h2 className="text-xl font-bold text-slate-800">Informasi Destinasi</h2>
                        </div>

                        {selectedDest ? (
                            <div className="overflow-y-auto pr-3 flex-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                                <div className="mb-6">
                                    <h1 className="text-2xl font-black text-blue-700 mb-2">{selectedDest.nama}</h1>
                                    <span className="inline-block bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                        {selectedDest.kategori}
                                    </span>
                                </div>

                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Deskripsi</h3>
                                <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 rounded-xl p-4 border border-slate-100 mb-8 shadow-inner">
                                    {selectedDest.deskripsi}
                                </p>

                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Estimasi Perjalanan OSRM</h3>

                                {!userLoc ? (
                                    <div className="text-sm text-amber-700 bg-amber-50 p-4 rounded-xl border border-amber-200">
                                        Menunggu akses lokasi Anda untuk menghitung rute...
                                    </div>
                                ) : isLoadingRoute ? (
                                    <div className="text-sm text-blue-700 bg-blue-50 p-4 rounded-xl border border-blue-200 text-center animate-pulse font-medium">
                                        Memproses rute tercepat...
                                    </div>
                                ) : routeInfo ? (
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div className="bg-blue-50/80 rounded-xl border border-blue-100 p-4 text-center shadow-sm">
                                            <div className="text-[10px] uppercase font-bold text-blue-500 mb-1 tracking-widest">Jarak Jauh</div>
                                            <div className="text-2xl font-black text-blue-800">{routeInfo.distanceKm} <span className="text-sm text-blue-600 font-semibold">km</span></div>
                                        </div>
                                        <div className="bg-blue-50/80 rounded-xl border border-blue-100 p-4 text-center shadow-sm">
                                            <div className="text-[10px] uppercase font-bold text-blue-500 mb-1 tracking-widest">Waktu Tempuh</div>
                                            <div className="text-2xl font-black text-blue-800">{routeInfo.durationMin} <span className="text-sm text-blue-600 font-semibold">min</span></div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-sm text-red-700 bg-red-50 p-4 rounded-xl border border-red-200">
                                        Rute gagal diproses. Pastikan titik lokasi tidak berada di luar jangkauan darat.
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-500">
                                <span className="text-5xl mb-4 opacity-50">📍</span>
                                <p className="text-sm font-medium">Belum ada destinasi yang dipilih.<br />Silakan pilih dari Hasil Rekomendasi.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}