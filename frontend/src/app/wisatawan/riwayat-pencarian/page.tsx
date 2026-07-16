"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type RiwayatPencarian = {
    id: string;
    keyword: string;
    created_at: string;
};

export default function RiwayatPencarianPage() {
    const [riwayat, setRiwayat] = useState<RiwayatPencarian[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [deleteAll, setDeleteAll] = useState(false);

    const fetchRiwayat = async () => {
        try {
            const rawData = localStorage.getItem("user_data");
            const userData = rawData ? JSON.parse(rawData) : null;

            if (!userData?.id) return;

            const res = await fetch(`http://localhost:8080/api/wisatawan-aktivitas/riwayat-pencarian/${userData.id}`);
            const data = await res.json();

            if (res.ok) {
                setRiwayat(data.data || []);
            }
        } catch (error) {
            console.error("Gagal mengambil riwayat pencarian:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchRiwayat();
    }, []);

    const handleDelete = async (riwayatId: string) => {
        if (!confirm("Apakah Anda yakin ingin menghapus kata kunci ini dari riwayat?")) return;

        setIsDeleting(riwayatId);
        try {
            const res = await fetch(`http://localhost:8080/api/wisatawan-aktivitas/riwayat-pencarian/${riwayatId}`, {
                method: "DELETE",
            });

            if (res.ok) {
                setRiwayat((prev) => prev.filter((item) => item.id !== riwayatId));
            } else {
                alert("Gagal menghapus riwayat pencarian.");
            }
        } catch (error) {
            console.error("Error menghapus riwayat:", error);
        } finally {
            setIsDeleting(null);
        }
    };

    const formatDate = (dateString: string) => {
        const options: Intl.DateTimeFormatOptions = {
            day: 'numeric', month: 'long', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        };
        return new Date(dateString).toLocaleDateString('id-ID', options);
    };

    const handleDeleteConfirm = async () => {
        try {
            const rawData = localStorage.getItem("user_data");
            const userData = rawData ? JSON.parse(rawData) : null;

            if (!userData?.id) {
                alert("Data pengguna tidak ditemukan.");
                return;
            }

            setIsDeleting("all");

            const res = await fetch(
                `http://localhost:8080/api/wisatawan-aktivitas/riwayat-pencarian/all/${userData.id}`,
                {
                    method: "DELETE",
                }
            );

            if (res.ok) {
                setRiwayat([]);
                alert("Semua riwayat pencarian berhasil dihapus.");
                setDeleteAll(false);
            } else {
                const data = await res.json();
                alert(data.message || "Gagal menghapus seluruh riwayat.");
            }
        } catch (error) {
            console.error("Error menghapus seluruh riwayat:", error);
            alert("Terjadi kesalahan saat menghapus riwayat.");
        } finally {
            setIsDeleting(null);
        }
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            {/* Header Section */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Riwayat Pencarian</h1>
                    <p className="text-slate-500 mt-1">Jejak kata kunci eksplorasi destinasi Anda.</p>
                </div>
                <div className="flex gap-2 items-center">
                    <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-xl font-bold text-sm">
                        Total: {riwayat.length} Pencarian
                    </div>
                    <button
                        className="bg-red-500 p-3 rounded-md text-white"
                        onClick={() => setDeleteAll(true)}
                    >Delete Semua
                    </button>
                </div>
            </div>

            {/* Content Section */}
            {isLoading ? (
                <div className="space-y-3">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-20 bg-slate-200 animate-pulse rounded-xl"></div>
                    ))}
                </div>
            ) : riwayat.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-sm">
                    <div className="text-4xl mb-4">🔍</div>
                    <h3 className="text-lg font-bold text-slate-800 mb-2">Belum ada riwayat pencarian</h3>
                    <p className="text-slate-500 mb-6">Mulai ketikkan sesuatu di halaman pencarian untuk menemukan destinasi menarik.</p>
                    <Link href="/wisatawan/cari-destinasi" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-colors">
                        Mulai Cari Destinasi
                    </Link>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <ul className="divide-y divide-slate-100">
                        {riwayat.map((item) => (
                            <li key={item.id} className="p-5 hover:bg-slate-50 transition-colors flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                                        🔍
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-800 text-lg">&quot;{item.keyword}</p>
                                        <p className="text-xs text-slate-500 mt-0.5">
                                            Dicari pada: {formatDate(item.created_at)}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleDelete(item.id)}
                                    disabled={isDeleting === item.id}
                                    className="text-slate-400 hover:text-red-500 bg-red-500 p-2 rounded-lg hover:bg-red-400 transition-all disabled:opacity-50"
                                    title="Hapus Pencarian"
                                >
                                    {isDeleting === item.id ? "⏳" : "🗑️"}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {deleteAll && (
                <div className="fixed inset-0 z-999 flex items-center justify-center p-4 backdrop-blur-sm bg-slate-900/40 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        {/* Header dengan ikon peringatan */}
                        <div className="p-6 pb-2 text-center">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-4">
                                <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-slate-800">Hapus Semua Riwayat?</h3>
                            <p className="text-slate-500 mt-2 text-sm leading-relaxed">
                                Tindakan ini tidak dapat dibatalkan. Semua data riwayat pencarian yang tersimpan akan dihapus secara permanen.
                            </p>
                        </div>

                        {/* Tombol Aksi */}
                        <div className="p-6 pt-4 grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setDeleteAll(false)}
                                className="px-4 py-2.5 rounded-xl font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleDeleteConfirm}
                                className="px-4 py-2.5 rounded-xl font-semibold text-white bg-red-600 hover:bg-red-700 transition-all shadow-lg shadow-red-200"
                            >
                                Hapus Data
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}