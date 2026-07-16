"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { ChevronDown, ChevronRight, Search } from 'lucide-react';

const MapGIS = dynamic(() => import("@/components/MapGIS"), {
    ssr: false,
    loading: () => <div className="flex items-center justify-center h-full text-slate-500 bg-slate-100">Memuat Peta...</div>
});

type Rekomendasi = {
    id: string;
    nama: string;
    kategori: string;
    deskripsi: string;
    latitude: number;
    longitude: number;
    similarity_score: number;
};

type RouteInfo = { distanceKm: string; durationMin: string } | null;

export default function CariDestinasiPage() {
    const [keyword, setKeyword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [hasilPencarian, setHasilPencarian] = useState<Rekomendasi[]>([]);
    const [userLoc, setUserLoc] = useState<{ lat: number, lng: number } | null>(null);
    const [selectedDest, setSelectedDest] = useState<Rekomendasi | null>(null);
    const [routeInfo, setRouteInfo] = useState<RouteInfo>(null);
    const [routePath, setRoutePath] = useState<[number, number][] | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isPanelOpen, setIsPanelOpen] = useState(true);
    const searchParams = useSearchParams();
    const destinationId = searchParams.get("dest");
    const [isRecommendationOpen, setIsRecommendationOpen] = useState(true);
    const [isDetailOpen, setIsDetailOpen] = useState(true);
    const autoOpenedRef = useRef<string | null>(null);

    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                (err) => console.warn("Akses lokasi ditolak:", err.message)
            );
        }
    }, []);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!keyword.trim()) return;

        setIsLoading(true);
        setRoutePath(null);
        setSelectedDest(null);

        try {
            const rawData = localStorage.getItem("user_data");
            const userData = rawData ? JSON.parse(rawData) : null;

            const res = await fetch("http://localhost:8080/api/wisatawan-aktivitas/cari", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id_wisatawan: userData?.id, keyword: keyword })
            });

            const data = await res.json();
            console.log("Response Backend:", data)
            if (res.ok) {
                setHasilPencarian(data.recommendations || []);
            } else {
                alert(data.error || "Gagal melakukan pencarian");
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleViewDetail = useCallback(async (dest: Rekomendasi) => {
        setSelectedDest(dest);
        setRouteInfo(null);
        setRoutePath(null);
        setIsSaving(true);
        setIsDetailOpen(true);

        // Tutup panel pencarian di mobile
        if (window.innerWidth < 1024) {
            setIsPanelOpen(false);
        }

        const rawData = localStorage.getItem("user_data");
        const userData = rawData ? JSON.parse(rawData) : null;

        if (userData?.id) {
            try {
                await fetch(
                    "http://localhost:8080/api/wisatawan-aktivitas/riwayat-destinasi",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            id_wisatawan: userData.id,
                            id_destinasi: dest.id,
                        }),
                    }
                );
            } catch (err) {
                console.error("Gagal mencatat riwayat", err);
            }
        }

        if (!userLoc) {
            setIsSaving(false);
        }

    }, [userLoc]);

    useEffect(() => {
        const autoOpenDestination = async () => {

            if (!destinationId) return;

            // Sudah pernah dibuka? Jangan ulangi lagi.
            if (autoOpenedRef.current === destinationId) return;

            autoOpenedRef.current = destinationId;

            try {

                const res = await fetch(
                    `http://localhost:8080/api/destinasi/${destinationId}`
                );

                if (!res.ok) return;

                const dest = await res.json();

                await handleViewDetail(dest);

            } catch (err) {
                console.error(
                    "Gagal membuka destinasi otomatis",
                    err
                );
            }
        };

        autoOpenDestination();

    }, [destinationId, handleViewDetail]);

    useEffect(() => {

        if (!selectedDest || !userLoc) return;

        const loadRoute = async () => {

            try {

                const osrmUrl =
                    `https://router.project-osrm.org/route/v1/driving/${userLoc.lng},${userLoc.lat};${selectedDest.longitude},${selectedDest.latitude}?alternatives=true&overview=full&geometries=geojson`;

                const routeRes = await fetch(osrmUrl);
                const routeData = await routeRes.json();

                if (routeData.code === "Ok" && routeData.routes.length > 0) {

                    const route = routeData.routes[0];

                    setRouteInfo({
                        distanceKm: (route.distance / 1000).toFixed(1),
                        durationMin: Math.round(route.duration / 60).toString(),
                    });

                    const coordinates = route.geometry.coordinates.map(
                        (coord: number[]) =>
                            [coord[1], coord[0]] as [number, number]
                    );

                    setRoutePath(coordinates);
                }

            } catch (err) {
                console.error("Gagal mengambil data rute", err);
            } finally {
                setIsSaving(false);
            }

        };

        loadRoute();

    }, [selectedDest, userLoc]);

    return (
        <div className="fixed left-0 right-0 bottom-0 top-16 z-0">

            {/* BACKGROUND: Peta (GIS) Full Screen */}
            <div className="absolute inset-0 z-0 bg-slate-200">
                <MapGIS
                    destinasiList={hasilPencarian}
                    selectedDest={selectedDest}
                    onViewDetail={handleViewDetail}
                    userLoc={userLoc}
                    routePath={routePath}
                />
            </div>

            {/* FOREGROUND: Panel Pencarian Mengambang (Floating Card) */}
            <div className={`absolute top-4 left-4 z-10 w-87.5 md:w-100 flex flex-col gap-4 max-h-[calc(100%-32px)] transition-transform duration-300 ${isPanelOpen ? 'translate-x-0' : 'translate-x-[-110%]'}`}>

                {/* Bagian Hero Form (Ngambang) */}
                <div className="bg-white/95 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-slate-100">
                    <div className="flex justify-between items-center mb-2">
                        <h1 className="text-xl font-bold text-slate-800">Eksplorasi Cerdas</h1>
                        <button onClick={() => setIsPanelOpen(false)} className="lg:hidden text-slate-400 hover:text-red-500 font-bold transition-colors">✕</button>
                    </div>
                    <p className="text-xs text-slate-500 mb-4">AI akan merekomendasikan destinasi liburanmu.</p>
                    <form onSubmit={handleSearch} className="flex flex-col gap-3">
                        <input
                            type="text"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            placeholder="Cari pantai, gunung, mall..."
                            className="w-full px-4 py-3 bg-slate-100 border border-slate-200/50 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all text-slate-800 placeholder:text-slate-400"
                            required
                        />
                        <button type="submit" disabled={isLoading} className={`w-full py-3 rounded-xl text-sm font-bold text-white transition-all ${isLoading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20"}`}>
                            {isLoading ? "Memproses AI..." : "Cari Destinasi"}
                        </button>
                    </form>
                </div>

                {/* List Rekomendasi (Ngambang & Scrollable) */}
                {hasilPencarian.length > 0 && (
                    <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-100 overflow-hidden">

                        {/* Header */}
                        <button
                            onClick={() => setIsRecommendationOpen(!isRecommendationOpen)}
                            className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                    Hasil Rekomendasi
                                </span>

                                <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                    {hasilPencarian.length}
                                </span>
                            </div>
                            <span className="text-slate-500 text-lg">
                                {isRecommendationOpen ? <ChevronDown /> : <ChevronRight />}
                            </span>
                        </button>

                        {isRecommendationOpen && (
                            <div className="p-4 border-t border-slate-100 max-h-105 overflow-y-auto">
                                <div className="space-y-3">

                                    {hasilPencarian.map((item) => (
                                        <div
                                            key={item.id}
                                            onClick={() => handleViewDetail(item)}
                                            className="p-3 rounded-xl border border-slate-100 hover:border-blue-300 hover:bg-blue-50 transition-all cursor-pointer group bg-white shadow-sm hover:shadow-md"
                                        >
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className="font-bold text-slate-800 text-sm group-hover:text-blue-600 line-clamp-1 pr-2">
                                                    {item.nama}
                                                </h4>
                                                <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                                                    {(item.similarity_score * 100).toFixed(0)}%
                                                </span>
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide bg-slate-100 px-2 py-0.5 rounded">
                                                {item.kategori}
                                            </span>
                                        </div>
                                    ))}

                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Tombol Buka Panel (Muncul kalau panel ditutup di layar kecil) */}
            {!isPanelOpen && (
                <button
                    onClick={() => setIsPanelOpen(true)}
                    className="absolute top-4 left-4 z-10 bg-white/95 backdrop-blur p-3.5 rounded-xl shadow-xl font-bold text-slate-700 hover:text-blue-600 border border-slate-100 transition-colors flex items-center gap-2"
                >
                    <span className="text-lg"><Search /></span> <span className="text-sm">Buka Pencarian</span>
                </button>
            )}

            {/* MODAL DETAIL DESTINASI */}
            {selectedDest && (
                <div
                    className={`
                        absolute top-4 right-4 z-20
                        w-90
                        max-h-[calc(100%-32px)]
                        transition-all duration-300
                        ${isDetailOpen ? "translate-x-0" : "translate-x-77.5"}
                    `}
                >
                    <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-100 overflow-hidden">

                        {/* HEADER */}
                        <button
                            onClick={() => setIsDetailOpen(!isDetailOpen)}
                            className="w-full flex items-center justify-between bg-blue-600 text-white px-5 py-4"
                        >
                            <div className="text-left">
                                <div className="text-xs uppercase opacity-80">
                                    {selectedDest.kategori}
                                </div>

                                <div className="font-bold text-lg">
                                    {selectedDest.nama}
                                </div>
                            </div>
                            <span className="text-2xl">
                                {isDetailOpen ? <ChevronDown /> : <ChevronRight />}
                            </span>
                        </button>

                        {isDetailOpen && (
                            <div className="p-5 overflow-y-auto max-h-[75vh]">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                                    Deskripsi
                                </h3>
                                <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 rounded-xl p-4 border border-slate-100 mb-6">
                                    {selectedDest.deskripsi}
                                </p>
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                                    Estimasi Perjalanan
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-blue-50 rounded-xl border border-blue-100 p-4 text-center">
                                        <div className="text-xs uppercase font-semibold text-blue-600 mb-1">
                                            Jarak
                                        </div>
                                        <div className="text-xl font-bold text-blue-800">
                                            {isSaving
                                                ? "..."
                                                : routeInfo
                                                    ? `${routeInfo.distanceKm} km`
                                                    : "-"}
                                        </div>
                                    </div>
                                    <div className="bg-blue-50 rounded-xl border border-blue-100 p-4 text-center">
                                        <div className="text-xs uppercase font-semibold text-blue-600 mb-1">
                                            Waktu
                                        </div>
                                        <div className="text-xl font-bold text-blue-800">
                                            {isSaving
                                                ? "..."
                                                : routeInfo
                                                    ? `${routeInfo.durationMin} menit`
                                                    : "-"}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}