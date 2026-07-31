"use client";

import { useState, useEffect } from "react";
import { MapPin, Star, Trash2, TriangleAlert } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";

type Destinasi = {
    id: string;
    nama: string;
};

type Wisatawan = {
    username: string;
    foto: string
};

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
    const [destinasiList, setDestinasiList] = useState<Destinasi[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState<number | "Semua">("Semua");
    const [selectedDestinasiId, setSelectedDestinasiId] = useState<string>("Semua");
    const [periodeLaporan, setPeriodeLaporan] = useState(() => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        return `${year}-${month}`;
    });
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedUlasan, setSelectedUlasan] = useState<Ulasan | null>(null);
    const [isDetailLoading, setIsDetailLoading] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchUlasan = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ulasan/`);
            const data = await res.json();
            if (res.ok) setUlasanList(data.data || []);
        } catch (error) {
            console.error("Gagal mengambil data ulasan:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchDestinasi = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/destinasi/`);
            const data = await res.json();

            if (res.ok) {
                setDestinasiList(data.data || []);
            }
        } catch (error) {
            console.error("Gagal mengambil destinasi:", error);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchUlasan();
        fetchDestinasi();
    }, []);

    const handleViewDetail = async (id: string) => {
        setIsDetailModalOpen(true);
        setIsDetailLoading(true);
        setSelectedUlasan(null);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ulasan/${id}`);
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

    const handleDelete = async () => {
        if (!deleteId) return;

        setIsDeleting(true);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ulasan/${deleteId}`, { method: "DELETE" });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Gagal menghapus ulasan");

            setDeleteId(null);
            fetchUlasan();
            setIsDetailModalOpen(false);
        } catch (err: unknown) {
            if (err instanceof Error) {
                toast.error(err.message);
            } else {
                console.error("Terjadi kesalahan");
            }
        }
    };

    const handleKirimData = async () => {
        try {
            const rawData = localStorage.getItem("user_data");
            const userData = rawData ? JSON.parse(rawData) : null;
            const adminId = userData?.id || "00000000-0000-0000-0000-000000000000";

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ulasan/kirim-laporan`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id_admin: adminId,
                    periode: periodeLaporan,
                    id_destinasi:
                        selectedDestinasiId === "Semua"
                            ? null
                            : selectedDestinasiId,
                    rating:
                        activeFilter === "Semua"
                            ? null
                            : activeFilter,
                })
            });

            const data = await res.json();
            if (res.ok) {
                toast.success("Sukses: " + data.message);
            } else {
                toast.error("Gagal: " + data.error);
            }
        } catch (error) {
            console.error("Error:", error);
            toast.error("Terjadi kesalahan koneksi ke server.");
        }
    };

    const formatDate = (dateString: string) => {
        const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('id-ID', options);
    };

    const filteredUlasan = ulasanList.filter((u) => {
        const cocokDestinasi =
            selectedDestinasiId === "Semua" ||
            u.id_destinasi === selectedDestinasiId;

        const cocokRating =
            activeFilter === "Semua" ||
            u.rating === activeFilter;

        return cocokDestinasi && cocokRating;
    });

    const filterOptions: (number | "Semua")[] = ["Semua", 5, 4, 3, 2, 1];

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto animate-in fade-in duration-300">
            <div className="flex flex-col md:flex-row justify-between md:items-center mb-8 gap-4">
                <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">Ulasan & Rating</h1>

                <div className="flex items-center gap-3">
                    <input
                        type="month"
                        value={periodeLaporan}
                        onChange={(e) => setPeriodeLaporan(e.target.value)}
                        className="border border-gray-300 rounded-md px-3 py-1.5 text-sm text-gray-700 outline-none 
                        focus:border-gray-500 focus:ring-1 focus:ring-gray-800 bg-white"
                    />
                    <button
                        onClick={handleKirimData}
                        className="border border-gray-400 bg-white hover:bg-gray-50 text-gray-800 px-4 py-1.5 
                        rounded-md text-sm font-medium transition-colors"
                    >
                        Kirim Data
                    </button>
                </div>
            </div>

            <div className="mb-6">
                <p className="text-gray-700 font-medium mb-3">
                    Filter berdasarkan destinasi wisata
                </p>

                <select
                    value={selectedDestinasiId}
                    onChange={(e) => setSelectedDestinasiId(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 bg-white text-sm text-gray-700 
                    outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-800 min-w-70"
                >
                    <option value="Semua">
                        Semua Destinasi
                    </option>

                    {[...destinasiList]
                        .sort((a, b) => a.nama.localeCompare(b.nama, "id"))
                        .map((d) => (
                            <option
                                key={d.id}
                                value={d.id}
                            >
                                {d.nama}
                            </option>
                        ))}
                </select>
            </div>

            <div className="mb-8">
                <p className="text-gray-700 font-medium mb-3">Filter berdasarkan rating</p>
                <div className="flex flex-wrap gap-2">
                    {filterOptions.map((option) => (
                        <button
                            key={option}
                            onClick={() => setActiveFilter(option)}
                            className={`flex items-center gap-1 border border-gray-400 px-4 py-1.5 text-sm transition-colors
                                ${activeFilter === option ? 'bg-gray-200 text-gray-900 shadow-sm'
                                    : 'bg-white text-gray-700 hover:bg-gray-50'}
                            `}
                        >
                            {option === "Semua" ? "Semua" : option}
                            {option !== "Semua" && <Star className="fill-yellow-400 text-yellow-400" size={16} />}
                        </button>
                    ))}
                </div>
            </div>

            <h3 className="text-gray-800 font-medium mb-3">Tabel Rating Wisatawan</h3>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="p-4 font-semibold text-gray-600 w-16 text-center">No</th>
                            <th className="p-4 font-semibold text-gray-600">Nama Destinasi</th>
                            <th className="p-4 font-semibold text-gray-600">Nama Wisatawan</th>
                            <th className="p-4 font-semibold text-gray-600 w-1/3 min-w-50">Ulasan</th>
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
                                            onClick={() => setDeleteId(u.id)}
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

            {isDetailModalOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4 animate-in 
                    fade-in duration-200">
                    <div className="bg-white p-6 rounded-xl w-full max-w-lg shadow-2xl relative">
                        <h2 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">Detail Ulasan</h2>

                        {isDetailLoading ? (
                            <div className="py-8 text-center text-gray-500">Memuat detail...</div>
                        ) : selectedUlasan ? (
                            <div className="space-y-4">
                                <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                    <Image
                                        src={selectedUlasan.wisatawan.foto ||
                                            `https://ui-avatars.com/api/?name=${selectedUlasan.wisatawan.username}`}
                                        alt="User"
                                        height={12}
                                        width={12}
                                        className="w-12 h-12 rounded-full border border-gray-200 shadow-sm" />
                                    <div>
                                        <div className="font-bold text-gray-800">{selectedUlasan.wisatawan.username}</div>
                                        <div className="text-xs text-gray-500">{formatDate(selectedUlasan.created_at)}</div>
                                    </div>
                                </div>

                                <div>
                                    <div className="text-sm text-gray-500 mb-1">Destinasi yang diulas:</div>
                                    <div className="font-semibold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-md inline-block">
                                        <div className="flex gap-2">
                                            <MapPin /> {selectedUlasan.destinasi.nama}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <div className="text-sm text-gray-500 mb-1">Rating:</div>
                                    <div className="flex gap-1">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <Star key={i} className={i < selectedUlasan.rating ? "fill-yellow-400 text-yellow-400"
                                                : "fill-gray-200 text-gray-200"} size={20} />
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <div className="text-sm text-gray-500 mb-1">Komentar Lengkap:</div>
                                    <div className="bg-gray-50 p-4 rounded-lg text-gray-700 whitespace-pre-wrap 
                                    leading-relaxed border border-gray-100">
                                        &quot;{selectedUlasan.komentar}
                                    </div>
                                </div>

                                <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center">
                                    <button onClick={() => setDeleteId(selectedUlasan.id)} className="text-red-500 
                                    hover:text-red-700 font-medium text-sm flex items-center gap-1 transition-colors">
                                        <Trash2 /> Hapus Ulasan (Moderasi)
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

            {deleteId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">

                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                                <TriangleAlert className="text-red-600" />
                            </div>

                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">
                                    Hapus Data Ulasan dan Rating
                                </h2>

                                <p className="mt-1 text-sm text-gray-600">
                                    Apakah Anda yakin ingin menghapus data ulasan dan rating ini?
                                </p>

                                <p className="mt-1 text-sm text-red-500">
                                    Tindakan ini tidak dapat dibatalkan.
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-3">

                            <button
                                onClick={() => setDeleteId(null)}
                                disabled={isDeleting}
                                className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-100"
                            >
                                Batal
                            </button>

                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"
                            >
                                {isDeleting ? "Menghapus..." : "Hapus"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}