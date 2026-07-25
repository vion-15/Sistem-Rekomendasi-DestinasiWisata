"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts";
import { LoaderCircle } from "lucide-react";
import toast from "react-hot-toast";

interface GrafikData {
    hari: string;
    pencarian: number;
}

interface MonitoringData {
    total_pencarian: number;
    pencarian_hari_ini: number;
    rata_rata_hari: number;
    puncak_pencarian: string;
    grafik: GrafikData[];
}

export default function PencarianPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<"aktivitas" | "monitoring">("aktivitas");
    const [keyword, setKeyword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [pencarian, setPencarian] = useState<string[]>([]);
    const [monitoringData, setMonitoringData] = useState<MonitoringData | null>(null);
    const [isLoadingStats, setIsLoadingStats] = useState(false);
    const [periodeLaporan, setPeriodeLaporan] = useState(() => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        return `${year}-${month}`; 
    });

    useEffect(() => {
        const savedHistory = localStorage.getItem("admin_search_history");
        if (savedHistory) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setPencarian(JSON.parse(savedHistory));
        } else {
            setPencarian([]);
            localStorage.setItem("admin_search_history", JSON.stringify([]));
        }
    }, []);

    useEffect(() => {
        if (activeTab === "monitoring" && !monitoringData) {
            const fetchStatistik = async () => {
                setIsLoadingStats(true);
                try {
                    const res = await fetch("http://localhost:8080/api/admin-aktivitas/statistik");
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

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!keyword.trim()) return;

        setIsLoading(true);

        try {
            const rawData = localStorage.getItem("user_data");
            const userData = rawData ? JSON.parse(rawData) : null;

            const res = await fetch("http://localhost:8080/api/admin-aktivitas/cari", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    id_admin: userData?.id || "dummy-admin-id", 
                    keyword: keyword 
                })
            });

            const data = await res.json();
            
            if (res.ok) {
                const recommendations = data.recommendations || data || [];
                localStorage.setItem("cbf_recommendations", JSON.stringify(recommendations));
                localStorage.setItem("search_keyword", keyword);

                const sisaRiwayat = pencarian.filter(item => item !== keyword);
                const riwayatBaru = [keyword, ...sisaRiwayat];
                
                setPencarian(riwayatBaru);
                localStorage.setItem("admin_search_history", JSON.stringify(riwayatBaru));

                router.push("/admin/hasil-rekomendasi");
            } else {
                toast.error(data.error || "Gagal melakukan pencarian");
            }
        } catch (error) {
            console.error("Error:", error);
            toast.error("Terjadi kesalahan koneksi ke server.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteHistory = (keywordTerpilih: string) => {
        const riwayatUpdate = pencarian.filter(item => item !== keywordTerpilih);
        setPencarian(riwayatUpdate);
        localStorage.setItem("admin_search_history", JSON.stringify(riwayatUpdate));
    };

    const stats = monitoringData ? [
        { label: "Total Pencarian", value: monitoringData.total_pencarian.toLocaleString("id-ID") },
        { label: "Pencarian Hari ini", value: monitoringData.pencarian_hari_ini.toLocaleString("id-ID") },
        { label: "Rata - Rata / Hari", value: monitoringData.rata_rata_hari.toLocaleString("id-ID") },
        { label: "Puncak Pencarian", value: monitoringData.puncak_pencarian },
    ] : [
        { label: "Total Pencarian", value: "0" },
        { label: "Pencarian Hari ini", value: "0" },
        { label: "Rata - Rata / Hari", value: "0" },
        { label: "Puncak Pencarian", value: "-" },
    ];

    const chartData = monitoringData?.grafik || [];

    const handleKirimData = async () => {
        try {
            const rawData = localStorage.getItem("user_data");
            const userData = rawData ? JSON.parse(rawData) : null;
            const adminId = userData?.id || "00000000-0000-0000-0000-000000000000";

            const res = await fetch("http://localhost:8080/api/admin-aktivitas/kirim-laporan", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    id_admin: adminId,
                    periode: periodeLaporan 
                })
            });

            const data = await res.json();

            if (res.ok) {
                toast.success(data.message);
            } else {
                toast.error("data periode ini sudah pernah dikirim");
            }
        } catch (error) {
            toast.error("terjadi kesalahan server");
            console.error(error);
        }
    };

    return (
        <div className="p-4 max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Pencarian</h1>
                <div className="flex gap-2 bg-gray-200/60 p-1 rounded-md">
                    <button onClick={() => setActiveTab("aktivitas")} 
                    className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all 
                    ${activeTab === "aktivitas" ? "bg-slate-200 text-slate-800 border border-slate-300 shadow-sm" 
                    : "text-slate-600 hover:bg-slate-100"}`}>Aktivitas</button>
                    <button onClick={() => setActiveTab("monitoring")} 
                    className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all 
                    ${activeTab === "monitoring" ? "bg-slate-200 text-slate-800 border border-slate-300 shadow-sm" 
                    : "text-slate-600 hover:bg-slate-100"}`}>Monitoring</button>
                </div>
            </div>

            {/* Tab Aktivitas */}
            {activeTab === "aktivitas" && (
                <div className="animate-in fade-in duration-300">
                    <form onSubmit={handleSearch} className="mb-6">
                        <div className="flex gap-4">
                            <div className="flex-1 relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                                <input type="text" placeholder="Cari destinasi wisata..." value={keyword} 
                                onChange={(e) => setKeyword(e.target.value)} disabled={isLoading} 
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded outline-none 
                                focus:ring-1 focus:ring-gray-800 text-slate-800 placeholder:text-slate-400 
                                disabled:bg-gray-100" />
                            </div>
                            <button type="submit" disabled={isLoading} 
                            className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 
                            font-medium px-8 rounded transition-colors shadow-sm">
                                {isLoading ? "Mencari..." : "Cari"}
                            </button>
                        </div>
                    </form>

                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Tabel Pencarian</h2>
                    <div className="bg-white border border-gray-200 overflow-hidden rounded-xl shadow-sm">
                        <table className="w-full border-collapse text-left">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="p-4 font-semibold text-gray-600 w-20">No</th>
                                    <th className="p-4 font-semibold text-gray-600">Keyword</th>
                                    <th className="p-4 font-semibold text-gray-600 text-center w-40">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pencarian.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="p-4 text-center text-gray-400 text-sm">
                                            Belum ada riwayat pencarian.
                                        </td>
                                    </tr>
                                ) : (
                                    pencarian.map((item, idx) => (
                                        <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                            <td className="p-4 text-gray-700">{idx + 1}</td>
                                            <td className="p-4 text-gray-700">{item}</td>
                                            <td className="p-4 text-center">
                                                <button 
                                                    type="button"
                                                    onClick={() => handleDeleteHistory(item)}
                                                    className="text-red-500 hover:text-red-700 font-medium transition-colors"
                                                >
                                                    Hapus
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            
            {/* Tab Monitoring */}
            {activeTab === "monitoring" && (
                <div className="animate-in fade-in duration-300">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold text-gray-800">Aktivitas Pencarian</h2>
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-600 font-medium">Periode:</span>
                            <input 
                                type="month" 
                                value={periodeLaporan}
                                onChange={(e) => setPeriodeLaporan(e.target.value)}
                                className="border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-700 
                                outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-800"
                            />
                            <button 
                                onClick={handleKirimData}
                                className="border border-gray-400 bg-gray-800 hover:bg-gray-700 text-white 
                                px-4 py-1.5 rounded shadow-sm text-sm font-medium transition-colors"
                            >
                                Kirim Data
                            </button>
                        </div>
                    </div>

                    {isLoadingStats ? (
                        <div className="flex justify-center items-center py-20 text-gray-500 text-sm font-medium">
                            <LoaderCircle />
                            Memuat data statistik...
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                                {stats.map((stat, i) => (
                                    <div key={i} 
                                    className="bg-[#e5e7eb] py-8 px-4 rounded-xl flex flex-col items-center 
                                    justify-center text-center">
                                        <span className="text-sm text-gray-700 font-medium mb-2">{stat.label}</span>
                                        <span className="text-xl font-semibold text-gray-900">{stat.value}</span>
                                    </div>
                                ))}
                            </div>

                            <div>
                                <h3 className="text-lg font-medium text-gray-800 mb-4">Grafik Aktivitas Pencarian (7 Hari Terakhir)</h3>
                                <div className="w-full h-80 bg-white border border-gray-300 rounded p-4">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                            <XAxis dataKey="hari" axisLine={false} 
                                            tickLine={false} tick={{ fill: '#4b5563', fontSize: 12 }} dy={10} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#4b5563', fontSize: 12 }} />
                                            <Tooltip contentStyle={{ borderRadius: '4px', border: '1px solid #d1d5db' }} />
                                            <Line type="linear" dataKey="pencarian" stroke="#374151" strokeWidth={2} 
                                            dot={{ r: 4, fill: '#374151' }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}