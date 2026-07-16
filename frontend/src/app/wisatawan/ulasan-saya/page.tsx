"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type Destinasi = {
    id: string;
    nama: string;
    kota: string;
    gambar: string;
};

type Ulasan = {
    id: string;
    rating: number;
    komentar: string;
    created_at: string;
    destinasi: Destinasi;
};

export default function UlasanSayaPage() {
    const [ulasan, setUlasan] = useState<Ulasan[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    useEffect(() => {
        fetchUlasan();
    }, []);

    const fetchUlasan = async () => {
        try {
            const rawData = localStorage.getItem("user_data");
            const userData = rawData ? JSON.parse(rawData) : null;

            if (!userData?.id) return;

            const res = await fetch(`http://localhost:8080/api/wisatawan-aktivitas/ulasan/${userData.id}`);
            const data = await res.json();

            if (res.ok) {
                setUlasan(data.data || []);
            }
        } catch (error) {
            console.error("Gagal mengambil data ulasan:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (ulasanId: string) => {
        if (!confirm("Apakah Anda yakin ingin menghapus ulasan ini?")) return;

        setIsDeleting(ulasanId);
        try {
            const res = await fetch(`http://localhost:8080/api/wisatawan-aktivitas/ulasan/${ulasanId}`, {
                method: "DELETE",
            });

            if (res.ok) {
                setUlasan((prev) => prev.filter((item) => item.id !== ulasanId));
            } else {
                alert("Gagal menghapus ulasan.");
            }
        } catch (error) {
            console.error("Error menghapus ulasan:", error);
        } finally {
            setIsDeleting(null);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', { 
            day: 'numeric', month: 'long', year: 'numeric' 
        });
    };

    const renderStars = (rating: number) => {
        return [...Array(5)].map((_, i) => (
            <span key={i} className={`text-xl ${i < rating ? "text-yellow-400" : "text-slate-200"}`}>
                ★
            </span>
        ));
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Ulasan Saya</h1>
                    <p className="text-slate-500 mt-1">Daftar ulasan dan penilaian yang pernah Anda berikan.</p>
                </div>
                <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-xl font-bold text-sm">
                    Total: {ulasan.length} Ulasan
                </div>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-40 bg-slate-200 animate-pulse rounded-2xl"></div>
                    ))}
                </div>
            ) : ulasan.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-sm">
                    <div className="text-4xl mb-4">⭐</div>
                    <h3 className="text-lg font-bold text-slate-800 mb-2">Belum ada ulasan</h3>
                    <p className="text-slate-500 mb-6">Bagikan pengalaman liburan Anda untuk membantu wisatawan lain.</p>
                    <Link href="/wisatawan/riwayat-destinasi" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-colors">
                        Lihat Riwayat Destinasi
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {ulasan.map((item) => (
                        <div key={item.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative group flex flex-col gap-4">
                            <button
                                onClick={() => handleDelete(item.id)}
                                disabled={isDeleting === item.id}
                                className="absolute top-4 right-4 text-slate-400 hover:text-red-500 bg-slate-50 hover:bg-red-50 p-2 rounded-lg transition-all disabled:opacity-50"
                                title="Hapus Ulasan"
                            >
                                {isDeleting === item.id ? "⏳" : "🗑️"}
                            </button>

                            <div className="flex gap-4 items-center">
                                <img 
                                    src={item.destinasi?.gambar || "https://placehold.co/100x100?text=No+Image"} 
                                    alt={item.destinasi?.nama} 
                                    className="w-16 h-16 rounded-xl object-cover border border-slate-100"
                                />
                                <div>
                                    <h3 className="font-bold text-slate-800 line-clamp-1">{item.destinasi?.nama}</h3>
                                    <p className="text-xs text-slate-500 mb-1">📍 {item.destinasi?.kota}</p>
                                    <div className="flex gap-1">{renderStars(item.rating)}</div>
                                </div>
                            </div>

                            <div className="bg-slate-50 p-4 rounded-xl text-slate-700 text-sm leading-relaxed flex-1 border border-slate-100/50">
                                &quot;{item.komentar}
                            </div>

                            <div className="text-xs text-slate-400 text-right">
                                Ditulis pada: {formatDate(item.created_at)}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}