"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

type Destinasi = {
    id: string;
    nama: string;
    deskripsi: string;
    kota: string;
    kategori: string;
    gambar: string;
    similarity_score?: number;
};

export default function WisatawanDashboard() {
    const [rekomendasi, setRekomendasi] = useState<Destinasi[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [userName, setUserName] = useState("");
    const [currentIndex, setCurrentIndex] = useState(0);
    const PER_PAGE = 6;

    const fetchRekomendasiPersonal = async (userId: string) => {
        try {
            const res = await fetch(
                `http://localhost:8080/api/wisatawan-aktivitas/rekomendasi/${userId}`
            );

            const data = await res.json();

            if (!res.ok) {
                setRekomendasi([]);
                return;
            }

            const rekomendasi = Array.isArray(data)
                ? data
                : Array.isArray(data.recommendations)
                    ? data.recommendations
                    : [];

            setRekomendasi(rekomendasi);
            setCurrentIndex(0);

        } catch (error) {
            console.error("Gagal memuat rekomendasi personal:", error);
            setRekomendasi([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const rawData = localStorage.getItem("user_data");
        if (rawData) {
            try {
                const userData = JSON.parse(rawData);
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setUserName(userData.nama || userData.username || "");
                fetchRekomendasiPersonal(userData.id);
            } catch (e) {
                console.error("Gagal parsing data user", e);
                setIsLoading(false);
            }
        } else {
            setIsLoading(false);
        }
    }, []);

    const displayedRekomendasi = rekomendasi.slice(
        currentIndex,
        currentIndex + PER_PAGE
    );

    return (
        <div className="space-y-8">
            <div className="bg-linear-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 
            sm:p-12 text-white shadow-lg relative overflow-hidden mb-10">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="max-w-xl">
                        <h1 className="text-lg sm:text-4xl lg:text-4xl font-extrabold tracking-tight leading-tight">
                            Temukan Destinasi Wisata yang Sesuai dengan Preferensi Anda
                        </h1>
                    </div>

                    <div className="shrink-0 mt-2 md:mt-0">
                        <Link
                            href="/wisatawan/pencarian"
                            className="inline-flex items-center rounded-2xl justify-center bg-white text-blue-700 border-2 
                            border-white px-8 py-3.5 font-bold text-base hover:bg-transparent hover:text-white transition-all 
                            duration-300 shadow-md"
                        >
                            Ayo Mulai
                        </Link>
                    </div>

                </div>
            </div>

            <div>
                <div className="flex justify-between items-end mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">Rekomendasi Untukmu {userName}</h2>
                        <p className="text-slate-500 text-sm mt-1">Dipilihkan khusus berdasarkan riwayat eksplorasimu.</p>
                    </div>
                    <button
                        disabled={rekomendasi.length <= PER_PAGE}
                        onClick={() => {
                            if (currentIndex + PER_PAGE >= rekomendasi.length) {
                                setCurrentIndex(0);
                            } else {
                                setCurrentIndex(currentIndex + PER_PAGE);
                            }
                        }}
                        className={`text-sm font-medium ${rekomendasi.length <= PER_PAGE
                                ? "text-gray-400 cursor-not-allowed"
                                : "text-blue-600 hover:underline"
                            }`}
                    >
                        Muat Ulang
                    </button>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white rounded-2xl h-80 animate-pulse border border-slate-100 shadow-sm"></div>
                        ))}
                    </div>
                ) : rekomendasi.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-2xl border border-slate-100 border-dashed">
                        <p className="text-slate-500">Belum ada data destinasi tersedia.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {displayedRekomendasi.map((d) => (
                            <div key={d.id} className="bg-white rounded-2xl overflow-hidden border border-slate-100 
                            shadow-sm hover:shadow-xl transition-all group flex flex-col">
                                <div className="h-48 relative overflow-hidden bg-slate-200">
                                    <Image
                                        src={d.gambar || "https://placehold.co/600x400/png?text=No+Image"}
                                        alt={d.nama}
                                        fill
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                                        <span className="bg-white/90 backdrop-blur text-slate-800 text-xs font-bold px-3 py-1.5 
                                        rounded-full shadow-sm">
                                            {d.kategori}
                                        </span>
                                        {d.similarity_score === 1.0 ? (
                                            <span className="bg-amber-100/90 backdrop-blur text-amber-700 text-xs 
                                            font-bold px-3 py-1.5 rounded-full shadow-sm">
                                                🔥 Populer
                                            </span>
                                        ) : d.similarity_score !== undefined ? (
                                            <span className="bg-emerald-100/90 backdrop-blur text-emerald-700 text-xs 
                                            font-bold px-3 py-1.5 rounded-full shadow-sm">
                                                ✨ {(d.similarity_score * 100).toFixed(0)}% Match
                                            </span>
                                        ) : null}
                                    </div>
                                </div>
                                <div className="p-5 flex-1 flex flex-col">
                                    <div className="text-xs font-semibold text-blue-600 mb-2 uppercase tracking-wider">
                                        📍 {d.kota || "Lokasi Tersedia"}
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-800 mb-2 line-clamp-1">{d.nama}</h3>
                                    <p className="text-slate-500 text-sm line-clamp-3 mb-4 flex-1">
                                        {d.deskripsi}
                                    </p>
                                    <Link
                                        href={`/wisatawan/cari-destinasi?dest=${d.id}`}
                                        className="w-full block text-center py-2.5 bg-slate-50 hover:bg-blue-50 
                                        text-slate-700 hover:text-blue-700 font-semibold rounded-xl transition-colors border 
                                        border-slate-200 hover:border-blue-200"
                                    >
                                        Rute
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}