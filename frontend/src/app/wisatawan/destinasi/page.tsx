"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { MapPin } from "lucide-react";

interface Destinasi {
    id: string;
    nama: string;
    kategori: string;
    deskripsi: string;
    latitude: number;
    longitude: number;
    kota?: string;
    gambar?: string; // Tambahkan properti gambar jika ada
    similarity_score?: number;
}

export default function DestinasiWisataPage() {
    const router = useRouter();
    const [destinasiList, setDestinasiList] = useState<Destinasi[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        fetchDestinasi();
    }, []);

    const fetchDestinasi = async () => {
        setIsLoading(true);
        setErrorMsg("");
        
        try {
            const res = await fetch("http://localhost:8080/api/destinasi/");
            const data = await res.json();
            
            if (res.ok) {
                setDestinasiList(data.data || []);
            } else {
                throw new Error(data.error || "Gagal mengambil data");
            }
        } catch (error) {
            console.error("Error fetch destinasi:", error);
            setErrorMsg("Terjadi kesalahan saat memuat data destinasi.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCekRute = (dest: Destinasi) => {
        localStorage.setItem("route_destination", JSON.stringify(dest));
        router.push("/wisatawan/lokasi-destinasi");
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-300">
            
            <h2 className="text-xl md:text-2xl font-semibold text-slate-900 mb-8">
                Destinasi Wisata:
            </h2>

            {isLoading && (
                <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                    <svg className="animate-spin mb-4 h-8 w-8 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="font-medium text-sm">Memuat daftar destinasi...</p>
                </div>
            )}

            {!isLoading && errorMsg && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-center font-medium">
                    {errorMsg}
                </div>
            )}

            {!isLoading && !errorMsg && destinasiList.length === 0 && (
                <div className="text-center py-20 bg-slate-50 rounded-2xl border border-slate-200">
                    <MapPin className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                    <p className="text-slate-500 font-medium">Belum ada data destinasi wisata yang tersedia.</p>
                </div>
            )}

            {/* Grid Card Destinasi (Desain Modern) */}
            {!isLoading && !errorMsg && destinasiList.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {destinasiList.map((d) => (
                        <div key={d.id} className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all group flex flex-col">
                            
                            {/* Bagian Gambar & Badge Label */}
                            <div className="h-48 relative overflow-hidden bg-slate-200">
                                <Image
                                    src={d.gambar || "https://placehold.co/600x400/png?text=No+Image"}
                                    alt={d.nama}
                                    fill
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                                    <span className="bg-white/90 backdrop-blur text-slate-800 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                                        {d.kategori}
                                    </span>
                                    {/* Label Dinamis AI (Opsional jika ada data skor) */}
                                    {d.similarity_score === 1.0 ? (
                                        <span className="bg-amber-100/90 backdrop-blur text-amber-700 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                                            🔥 Populer
                                        </span>
                                    ) : d.similarity_score !== undefined ? (
                                        <span className="bg-emerald-100/90 backdrop-blur text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                                            ✨ {(d.similarity_score * 100).toFixed(0)}% Match
                                        </span>
                                    ) : null}
                                </div>
                            </div>

                            {/* Bagian Teks & Tombol */}
                            <div className="p-5 flex-1 flex flex-col">
                                <div className="text-xs font-semibold text-blue-600 mb-2 uppercase tracking-wider">
                                    📍 {d.kota || "Lokasi Tersedia"}
                                </div>
                                <h3 className="text-lg font-bold text-slate-800 mb-2 line-clamp-1">{d.nama}</h3>
                                <p className="text-slate-500 text-sm line-clamp-3 mb-4 flex-1">
                                    {d.deskripsi}
                                </p>
                                
                                <button
                                    onClick={() => handleCekRute(d)}
                                    className="w-full block text-center py-2.5 bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-semibold rounded-xl transition-colors border border-slate-200 hover:border-blue-200"
                                >
                                    Rute
                                </button>
                            </div>
                            
                        </div>
                    ))}
                </div>
            )}

        </div>
    );
}