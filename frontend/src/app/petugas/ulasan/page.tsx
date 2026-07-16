"use client";

import { useState, useEffect } from "react";
import { Star } from "lucide-react"; 

type Destinasi = { nama: string };
type Wisatawan = { username: string; foto: string };

type Ulasan = {
    id: string;
    id_destinasi: string;
    id_wisatawan: string;
    rating: number;
    komentar: string;
    created_at: string;
    destinasi: Destinasi;
    wisatawan: Wisatawan;
};

export default function UlasanPage() {
    const [ulasanList, setUlasanList] = useState<Ulasan[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // State untuk Filter
    const [activeFilter, setActiveFilter] = useState<number | "Semua">("Semua");

    // State untuk Laporan
    const [periodeLaporan, setPeriodeLaporan] = useState(() => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        return `${year}-${month}`; 
    });

    // State untuk Detail Modal
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedUlasan, setSelectedUlasan] = useState<Ulasan | null>(null);
    const [isDetailLoading, setIsDetailLoading] = useState(false);

    useEffect(() => {
        fetchUlasan();
    }, []);

    const fetchUlasan = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("http://localhost:8080/api/ulasan/");
            const data = await res.json();
            if (res.ok) setUlasanList(data.data || []);
        } catch (error) {
            console.error("Gagal mengambil data ulasan:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleViewDetail = async (id: string) => {
        setIsDetailModalOpen(true);
        setIsDetailLoading(true);
        setSelectedUlasan(null);

        try {
            const res = await fetch(`http://localhost:8080/api/ulasan/${id}`);
            const data = await res.json();
            if (res.ok) {
                setSelectedUlasan(data.data);
            }
        } catch (error) {
            console.error("Gagal mengambil detail ulasan:", error);
        } finally {
            setIsDetailLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Peringatan: Apakah Anda yakin ingin menghapus ulasan ini?")) return;

        try {
            const res = await fetch(`http://localhost:8080/api/ulasan/${id}`, { method: "DELETE" });
            const data = await res.json();
            
            if (!res.ok) throw new Error(data.error || "Gagal menghapus ulasan");
            
            fetchUlasan();
            setIsDetailModalOpen(false); 
        } catch (err: unknown) {
            if (err instanceof Error) {
                alert(err.message);
            } else {
                alert("Terjadi kesalahan");
            }
        }
    };

    // FUNGSI BARU: Kirim Data ke Menu Laporan
    const handleKirimData = async () => {
        try {
            const rawData = localStorage.getItem("user_data");
            const userData = rawData ? JSON.parse(rawData) : null;
            const adminId = userData?.id || "00000000-0000-0000-0000-000000000000";

            const res = await fetch("http://localhost:8080/api/ulasan/kirim-laporan", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id_admin: adminId, periode: periodeLaporan })
            });

            const data = await res.json();
            if (res.ok) {
                alert("Sukses: " + data.message);
            } else {
                alert("Gagal: " + data.error);
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Terjadi kesalahan koneksi ke server.");
        }
    };

    const formatDate = (dateString: string) => {
        const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('id-ID', options);
    };

    const filteredUlasan = activeFilter === "Semua" 
        ? ulasanList 
        : ulasanList.filter(u => u.rating === activeFilter);

    const filterOptions: (number | "Semua")[] = ["Semua", 5, 4, 3, 2, 1];

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto animate-in fade-in duration-300">
            
            {/* HEADER (DIREVISI UNTUK MENAMBAHKAN INPUT BULAN) */}
            <div className="flex flex-col md:flex-row justify-between md:items-center mb-8 gap-4">
                <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">Ulasan & Rating</h1>
                
                <div className="flex items-center gap-3">
                    <input 
                        type="month" 
                        value={periodeLaporan}
                        onChange={(e) => setPeriodeLaporan(e.target.value)}
                        className="border border-gray-300 rounded-md px-3 py-1.5 text-sm text-gray-700 outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-800 bg-white"
                    />
                    <button 
                        onClick={handleKirimData}
                        className="border border-gray-400 bg-white hover:bg-gray-50 text-gray-800 px-4 py-1.5 rounded-md text-sm font-medium transition-colors"
                    >
                        Kirim Data
                    </button>
                </div>
            </div>

            {/* FILTER SECTION */}
            <div className="mb-8">
                <p className="text-gray-700 font-medium mb-3">Filter berdasarkan rating</p>
                <div className="flex flex-wrap gap-2">
                    {filterOptions.map((option) => (
                        <button
                            key={option}
                            onClick={() => setActiveFilter(option)}
                            className={`flex items-center gap-1 border border-gray-400 px-4 py-1.5 text-sm transition-colors
                                ${activeFilter === option ? 'bg-gray-200 text-gray-900 shadow-sm' : 'bg-white text-gray-700 hover:bg-gray-50'}
                            `}
                        >
                            {option === "Semua" ? "Semua" : option}
                            {option !== "Semua" && <Star className="fill-gray-800 text-gray-800" size={16} />}
                        </button>
                    ))}
                </div>
            </div>

            <h3 className="text-gray-800 font-medium mb-3">Tabel Rating Wisatawan</h3>
            
            {/* TABEL DATA ULASAN */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="p-4 font-semibold text-gray-600 w-16 text-center">No</th>
                            <th className="p-4 font-semibold text-gray-600">Nama Destinasi</th>
                            <th className="p-4 font-semibold text-gray-600">Nama Wisatawan</th>
                            <th className="p-4 font-semibold text-gray-600 w-1/3 min-w-[200px]">Ulasan</th>
                            <th className="p-4 font-semibold text-gray-600 text-center">Rating</th>
                            <th className="p-4 font-semibold text-gray-600 text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan={6} className="p-4 text-center text-gray-500">Memuat data...</td>
                            </tr>
                        ) : filteredUlasan.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="p-4 text-center text-gray-500">
                                    Belum ada ulasan ditemukan.
                                </td>
                            </tr>
                        ) : (
                            filteredUlasan.map((u, index) => (
                                <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                    <td className="p-4 text-gray-600 text-center">{index + 1}</td>
                                    <td className="p-4 text-gray-600">{u.destinasi.nama}</td>
                                    <td className="p-4 text-gray-600">{u.wisatawan.username}</td>
                                    <td className="p-4 text-gray-600 text-sm whitespace-normal max-w-xs">
                                        <p className="line-clamp-2">{u.komentar}</p>
                                    </td>
                                    <td className="p-4 text-gray-600 text-center font-medium">
                                        {u.rating}/5
                                    </td>
                                    <td className="p-4 text-center">
                                        <button 
                                            onClick={() => handleViewDetail(u.id)} 
                                            className=" bg-white hover:bg-gray-100 text-green-600 px-3 py-1 text-sm transition-colors mx-1 inline-block"
                                        >
                                            Lihat
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(u.id)} 
                                            className="bg-white hover:bg-gray-100 text-red-600 px-3 py-1 text-sm transition-colors mx-1 inline-block"
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

            {/* MODAL DETAIL ULASAN (TIDAK BERUBAH) */}
            {isDetailModalOpen && (
                <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white p-6 rounded-xl w-full max-w-lg shadow-2xl relative">
                        <button onClick={() => setIsDetailModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 font-bold text-xl">&times;</button>
                        
                        <h2 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">Detail Ulasan</h2>
                        
                        {isDetailLoading ? (
                            <div className="py-8 text-center text-gray-500">Memuat detail...</div>
                        ) : selectedUlasan ? (
                            <div className="space-y-4">
                                <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                    <img src={selectedUlasan.wisatawan.foto || `https://ui-avatars.com/api/?name=${selectedUlasan.wisatawan.username}`} alt="User" className="w-12 h-12 rounded-full border border-gray-200 shadow-sm" />
                                    <div>
                                        <div className="font-bold text-gray-800">{selectedUlasan.wisatawan.username}</div>
                                        <div className="text-xs text-gray-500">{formatDate(selectedUlasan.created_at)}</div>
                                    </div>
                                </div>

                                <div>
                                    <div className="text-sm text-gray-500 mb-1">Destinasi yang diulas:</div>
                                    <div className="font-semibold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-md inline-block">
                                        📍 {selectedUlasan.destinasi.nama}
                                    </div>
                                </div>

                                <div>
                                    <div className="text-sm text-gray-500 mb-1">Rating:</div>
                                    <div className="flex gap-1">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <Star key={i} className={i < selectedUlasan.rating ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"} size={20} />
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <div className="text-sm text-gray-500 mb-1">Komentar Lengkap:</div>
                                    <div className="bg-gray-50 p-4 rounded-lg text-gray-700 whitespace-pre-wrap leading-relaxed border border-gray-100">
                                        &quot;{selectedUlasan.komentar}
                                    </div>
                                </div>

                                <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center">
                                    <button onClick={() => handleDelete(selectedUlasan.id)} className="text-red-500 hover:text-red-700 font-medium text-sm flex items-center gap-1 transition-colors">
                                        🗑️ Hapus Ulasan (Moderasi)
                                    </button>
                                    <button onClick={() => setIsDetailModalOpen(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors">
                                        Tutup
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="py-8 text-center text-red-500">Data tidak ditemukan.</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}