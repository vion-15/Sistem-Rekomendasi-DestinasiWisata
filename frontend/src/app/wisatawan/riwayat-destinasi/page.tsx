"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { CircleX, LoaderCircle, MapPin } from 'lucide-react';

type Destinasi = {
    id: string;
    nama: string;
    kategori: string;
    kota: string;
    gambar: string;
};

type RiwayatDestinasi = {
    id: string;
    created_at: string;
    destinasi: Destinasi;
};

export default function RiwayatDestinasiPage() {
    const [riwayat, setRiwayat] = useState<RiwayatDestinasi[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [reviewModalData, setReviewModalData] = useState<Destinasi | null>(null);
    const [rating, setRating] = useState<number>(0);
    const [komentar, setKomentar] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deleteAll, setDeleteAll] = useState(false);

    const fetchRiwayat = async () => {
        try {
            const rawData = localStorage.getItem("user_data");
            const userData = rawData ? JSON.parse(rawData) : null;
            if (!userData?.id) return;

            const res = await fetch(`http://localhost:8080/api/wisatawan-aktivitas/riwayat-destinasi/${userData.id}`);
            const data = await res.json();
            if (res.ok) setRiwayat(data.data || []);
        } catch (error) {
            console.error("Gagal mengambil riwayat destinasi:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchRiwayat();
    }, []);

    const handleDelete = async (riwayatId: string) => {
        if (!confirm("Apakah Anda yakin ingin menghapus destinasi ini dari riwayat?")) return;
        setIsDeleting(riwayatId);
        try {
            const res = await fetch(`http://localhost:8080/api/wisatawan-aktivitas/riwayat-destinasi/${riwayatId}`, { method: "DELETE" });
            if (res.ok) setRiwayat((prev) => prev.filter((item) => item.id !== riwayatId));
        } catch (error) {
            console.error("Error menghapus riwayat:", error);
        } finally {
            setIsDeleting(null);
        }
    };

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) {
            alert("Silakan berikan rating bintang terlebih dahulu.");
            return;
        }

        setIsSubmitting(true);
        try {
            const rawData = localStorage.getItem("user_data");
            const userData = rawData ? JSON.parse(rawData) : null;

            const res = await fetch("http://localhost:8080/api/wisatawan-aktivitas/ulasan", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id_wisatawan: userData?.id,
                    id_destinasi: reviewModalData?.id,
                    rating: rating,
                    komentar: komentar
                })
            });

            if (res.ok) {
                alert("Ulasan berhasil dikirim! Terima kasih atas kontribusi Anda.");
                setReviewModalData(null);
                setRating(0);
                setKomentar("");
            } else {
                alert("Gagal mengirim ulasan.");
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
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
                `http://localhost:8080/api/wisatawan-aktivitas/riwayat-destinasi/all/${userData.id}`,
                {
                    method: "DELETE",
                }
            );

            if (res.ok) {
                setRiwayat([]);
                alert("Semua riwayat destinasi berhasil dihapus.");
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
    };

    return (
        <div className="space-y-6 relative">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Riwayat Destinasi</h1>
                    <p className="text-slate-500 mt-1">Daftar tempat wisata yang pernah Anda lihat.</p>
                </div>
                <button
                    className="bg-red-500 p-3 rounded-md text-white"
                    onClick={() => setDeleteAll(true)}
                >Delete Semua</button>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => <div key={i} className="h-48 bg-slate-200 animate-pulse rounded-2xl"></div>)}
                </div>
            ) : riwayat.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-sm text-slate-800 placeholder:text-slate-400">
                    <p>Belum ada riwayat destinasi.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {riwayat.map((item) => (
                        <div key={item.id} className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm flex flex-col relative">
                            <button onClick={() => handleDelete(item.id)} className="absolute top-3 right-3 z-10 bg-red-500/90 text-white p-2 rounded-full shadow-sm hover:bg-red-600 transition-colors">
                                {isDeleting === item.id ? (
                                    <LoaderCircle className="animate-spin" />
                                ) : (
                                    <CircleX />
                                )}
                            </button>
                            <div className="h-40 relative overflow-hidden bg-slate-200">
                                <Image src={item.destinasi.gambar || "https://placehold.co/600x400/png?text=No+Image"} alt={item.destinasi.nama} fill className="w-full h-full object-cover" />
                            </div>
                            <div className="p-5 flex-1 flex flex-col">
                                <div className="text-xs font-semibold flex items-center gap-1 text-blue-600 mb-1 uppercase tracking-wider"><MapPin className="text-green-500" />{item.destinasi.kota}</div>
                                <h3 className="text-lg font-bold text-slate-800 mb-2 line-clamp-1">{item.destinasi.nama}</h3>
                                <div className="text-xs text-slate-500 mb-4">Dilihat: {formatDate(item.created_at)}</div>

                                {/* Tombol Buka Modal Ulasan */}
                                <button
                                    onClick={() => setReviewModalData(item.destinasi)}
                                    className="mt-auto w-full py-2 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-semibold rounded-xl transition-colors border border-slate-200 hover:border-blue-200"
                                >
                                    ⭐ Beri Ulasan
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* MODAL ULASAN */}
            {reviewModalData && (
                <div className="fixed inset-0 bg-slate-900/60 z-999 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden relative">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-slate-800">Bagikan Pengalamanmu</h2>
                            <button onClick={() => { setReviewModalData(null); setRating(0); setKomentar(""); }} className="text-slate-400 hover:text-red-500 text-xl font-bold">✕</button>
                        </div>

                        <form onSubmit={handleSubmitReview} className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Destinasi</label>
                                <div className="p-3 bg-slate-50 rounded-lg text-slate-600 font-medium border border-slate-100">
                                    {reviewModalData.nama}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Penilaian Anda <span className="text-red-500">*</span></label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            className={`text-3xl transition-transform hover:scale-110 ${rating >= star ? 'text-yellow-400' : 'text-slate-200'}`}
                                        >
                                            ★
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Tuliskan Komentar <span className="text-red-500">*</span></label>
                                <textarea
                                    required
                                    value={komentar}
                                    onChange={(e) => setKomentar(e.target.value)}
                                    placeholder="Ceritakan pengalaman liburan atau hal menarik yang Anda temukan di sini..."
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all h-32 resize-none text-slate-800 placeholder:text-slate-400"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`w-full py-3 rounded-xl font-bold text-white transition-all ${isSubmitting ? "bg-slate-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
                            >
                                {isSubmitting ? "Mengirim..." : "Kirim Ulasan"}
                            </button>
                        </form>
                    </div>
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
                                Tindakan ini tidak dapat dibatalkan. Semua data riwayat destinasi yang tersimpan akan dihapus secara permanen.
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