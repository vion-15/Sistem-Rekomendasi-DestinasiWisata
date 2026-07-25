"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { ArrowLeft, Info, LoaderCircle } from "lucide-react"; 
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts";
import toast from "react-hot-toast";

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
    kota: string;
    deskripsi: string;
    latitude: number;
    longitude: number;
    similarity_score: number;
}

interface GrafikDestinasi {
    hari: string;
    interaksi: number;
}

interface MonitoringDestinasi {
    total_destinasi: number;
    destinasi_baru: number;
    interaksi_pengguna: number;
    grafik: GrafikDestinasi[];
}

type RouteInfo = { distanceKm: string; durationMin: string } | null;

export default function LokasiDestinasiPage() {
    const [activeTab, setActiveTab] = useState<"aktivitas" | "monitoring">("aktivitas");
    const [isCardOpen, setIsCardOpen] = useState(true); 
    const [selectedDest, setSelectedDest] = useState<DestinasiMap | null>(null);
    const [userLoc, setUserLoc] = useState<{ lat: number, lng: number } | null>(null);
    const [routeInfo, setRouteInfo] = useState<RouteInfo>(null);
    const [routePath, setRoutePath] = useState<[number, number][] | null>(null);
    const [isLoadingRoute, setIsLoadingRoute] = useState(false);
    const [monitoringData, setMonitoringData] = useState<MonitoringDestinasi | null>(null);
    const [isLoadingStats, setIsLoadingStats] = useState(false);
    const [periodeLaporan, setPeriodeLaporan] = useState(() => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        return `${year}-${month}`; 
    });

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
                kota: rawData.kota || "-",
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

    useEffect(() => {
        if (activeTab === "monitoring" && !monitoringData) {
            const fetchStatistik = async () => {
                setIsLoadingStats(true);
                try {
                    const res = await fetch("http://localhost:8080/api/admin-aktivitas/statistik-destinasi");
                    if (res.ok) {
                        const data = await res.json();
                        setMonitoringData(data);
                    }
                } catch (error) {
                    console.error("Gagal mengambil data statistik:", error);
                } finally {
                    setIsLoadingStats(false);
                }
            };
            fetchStatistik();
        }
    }, [activeTab, monitoringData]);

    const handleCloseCard = () => setIsCardOpen(false);

    const handleKirimData = async () => {
        try {
            const rawData = localStorage.getItem("user_data");
            const userData = rawData ? JSON.parse(rawData) : null;
            const adminId = userData?.id || "00000000-0000-0000-0000-000000000000";

            const res = await fetch("http://localhost:8080/api/admin-aktivitas/kirim-laporan-destinasi", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id_admin: adminId, periode: periodeLaporan })
            });

            const data = await res.json();
            if (res.ok) {
                toast.success(data.message);
            } else {
                toast.error(data.error);
            }
        } catch (error) {
            console.error("Error:", error);
            toast.error("Terjadi kesalahan koneksi ke server.");
        }
    };

    const stats = monitoringData ? [
        { label: "Total Destinasi", value: monitoringData.total_destinasi.toLocaleString("id-ID") },
        { label: "Destinasi Baru / hari", value: monitoringData.destinasi_baru.toLocaleString("id-ID") },
        { label: "Interaksi Pengguna", value: monitoringData.interaksi_pengguna.toLocaleString("id-ID") },
    ] : [
        { label: "Total Destinasi", value: "128" },
        { label: "Destinasi Baru / hari", value: "3" },
        { label: "Interaksi Pengguna", value: "1,492" },
    ];

    const chartData = monitoringData?.grafik || [
        { hari: "Senin", interaksi: 120 }, { hari: "Selasa", interaksi: 150 },
        { hari: "Rabu", interaksi: 180 }, { hari: "Kamis", interaksi: 140 },
        { hari: "Jumat", interaksi: 210 }, { hari: "Sabtu", interaksi: 280 },
        { hari: "Minggu", interaksi: 320 },
    ];

    return (
        <div 
            className="relative w-[calc(100%+3rem)] h-[calc(100vh-72px)] -m-6 overflow-hidden bg-slate-100 z-0 
            flex flex-col [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] scrollbar-none">
            <div 
                className={`absolute inset-0 z-0 transition-opacity duration-300 
                ${activeTab === "monitoring" ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
                <MapGIS
                    key="peta-lokasi-destinasi"
                    destinasiList={selectedDest ? [selectedDest] : []}
                    selectedDest={selectedDest}
                    onViewDetail={() => {}} 
                    userLoc={userLoc}
                    routePath={routePath}
                />
            </div>

            {activeTab === "monitoring" && (
                <div className="absolute top-4 left-6 md:left-8 z-30 flex items-center h-11">
                    <h1 className="text-xl font-bold text-slate-800">Lokasi Destinasi</h1>
                </div>
            )}

            <div 
                className="absolute top-4 right-6 z-30 flex gap-2 bg-white/95 backdrop-blur-sm p-1.5 rounded-lg 
                shadow-md border border-slate-200">
                <button 
                    onClick={() => setActiveTab("aktivitas")} 
                    className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all 
                        ${activeTab === "aktivitas" ? "bg-slate-200 text-slate-800 border border-slate-300 shadow-sm" 
                            : "text-slate-600 hover:bg-slate-100"}`}
                >
                    Aktivitas
                </button>
                <button 
                    onClick={() => setActiveTab("monitoring")} 
                    className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all 
                        ${activeTab === "monitoring" ? "bg-slate-200 text-slate-800 border border-slate-300 shadow-sm" 
                            : "text-slate-600 hover:bg-slate-100"}`}
                >
                    Monitoring
                </button>
            </div>

            {!isCardOpen && activeTab === "aktivitas" && (
                <button
                    onClick={() => setIsCardOpen(true)}
                    className="absolute top-4 left-14 z-10 flex items-center gap-2 bg-white/95 backdrop-blur-md px-4 py-3 
                    rounded-xl shadow-lg border border-slate-200 text-slate-700 hover:text-blue-600 font-bold transition-all"
                >
                    <Info size={20} />
                    Lihat Info Destinasi
                </button>
            )}

            {isCardOpen && activeTab === "aktivitas" && (
                <div 
                    className="absolute top-4 left-14 bottom-4 z-10 w-80 md:w-104 flex flex-col animate-in 
                    slide-in-from-left-8 duration-300">
                    <div 
                        className="bg-white/95 backdrop-blur-md p-6 rounded-2xl shadow-2xl border 
                        border-slate-200 flex flex-col h-full overflow-hidden">
                        
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
                            <div 
                                className="overflow-y-auto pr-3 flex-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] 
                                scrollbar-none">
                                <div className="mb-6">
                                    <h1 className="text-2xl font-black text-blue-700 mb-2">{selectedDest.nama}</h1>
                                    <span className="inline-block bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 
                                    rounded-full uppercase tracking-wider">
                                        {selectedDest.kategori}
                                    </span>
                                    <span className="bg-orange-300 text-white py-1 rounded-full px-3 ml-2">{selectedDest.kota}</span>
                                </div>
                                
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Deskripsi</h3>
                                <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 rounded-xl p-4 border 
                                border-slate-100 mb-8 shadow-inner">
                                    {selectedDest.deskripsi}
                                </p>

                                <h3 
                                    className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                                        Estimasi Perjalanan OSRM
                                </h3>
                                
                                {!userLoc ? (
                                    <div className="text-sm text-amber-700 bg-amber-50 p-4 rounded-xl border border-amber-200">
                                        Menunggu akses lokasi Anda untuk menghitung rute...
                                    </div>
                                ) : isLoadingRoute ? (
                                    <div className="text-sm text-blue-700 bg-blue-50 p-4 rounded-xl border 
                                    border-blue-200 text-center animate-pulse font-medium">
                                        Memproses rute tercepat...
                                    </div>
                                ) : routeInfo ? (
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div className="bg-blue-50/80 rounded-xl border border-blue-100 p-4 text-center shadow-sm">
                                            <div className="text-[10px] uppercase font-bold text-blue-500 mb-1 tracking-widest">
                                                Jarak Jauh</div>
                                            <div className="text-2xl font-black text-blue-800">{routeInfo.distanceKm} 
                                                <span className="text-sm text-blue-600 font-semibold">km</span>
                                            </div>
                                        </div>
                                        <div className="bg-blue-50/80 rounded-xl border border-blue-100 p-4 text-center shadow-sm">
                                            <div className="text-[10px] uppercase font-bold text-blue-500 mb-1 tracking-widest">
                                                Waktu Tempuh</div>
                                            <div className="text-2xl font-black text-blue-800">{routeInfo.durationMin} 
                                                <span className="text-sm text-blue-600 font-semibold">min</span>
                                            </div>
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
                                <p className="text-sm font-medium">Belum ada destinasi yang dipilih.
                                    <br/>Silakan pilih dari Hasil Rekomendasi.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === "monitoring" && (
                <div className="absolute inset-0 z-20 bg-white overflow-y-auto animate-in fade-in duration-300 
                [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] scrollbar-none">
                    <div className="max-w-6xl mx-auto pt-24 pb-12 px-6 md:px-8">
                        
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                            <h2 className="text-2xl font-bold text-slate-800">Aktivitas Lokasi Destinasi</h2>
                            
                            <div className="flex items-center gap-3">
                                <input 
                                    type="month" 
                                    value={periodeLaporan}
                                    onChange={(e) => setPeriodeLaporan(e.target.value)}
                                    className="border border-slate-300 rounded-md px-3 py-1.5 text-sm text-slate-700 
                                    outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-800 bg-white"
                                />
                                <button 
                                    onClick={handleKirimData}
                                    className="border border-slate-400 bg-white hover:bg-slate-50 text-slate-800 
                                    px-5 py-1.5 rounded-md shadow-sm text-sm font-semibold transition-colors"
                                >
                                    Kirim Data
                                </button>
                            </div>
                        </div>

                        {isLoadingStats ? (
                            <div className="flex justify-center items-center py-32 text-slate-500 text-sm font-medium">
                                <LoaderCircle />
                                Memuat data statistik destinasi...
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 w-full">
                                    {stats.map((stat, i) => (
                                        <div key={i} className="bg-slate-100 py-8 px-6 rounded-xl flex 
                                        flex-col items-center justify-center text-center shadow-sm border border-slate-200">
                                            <span className="text-sm text-slate-600 font-medium mb-3">{stat.label}</span>
                                            <span className="text-3xl font-bold text-slate-800">{stat.value}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="w-full">
                                    <h3 className="text-lg font-semibold text-slate-800 mb-6">
                                        Grafik Aktivitas Lokasi Destinasi (7 Hari Terakhir)</h3>
                                    <div className="w-full h-100 bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                                <XAxis dataKey="hari" axisLine={false} tickLine={false} 
                                                tick={{ fill: '#64748b', fontSize: 12 }} dy={15} />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                                <Tooltip 
                                                contentStyle={{ borderRadius: '8px', border: '1px solid #cbd5e1', 
                                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                                <Area 
                                                    type="monotone" 
                                                    dataKey="interaksi" 
                                                    stroke="#475569" 
                                                    strokeWidth={2} 
                                                    fill="#cbd5e1" 
                                                    fillOpacity={0.3} 
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}