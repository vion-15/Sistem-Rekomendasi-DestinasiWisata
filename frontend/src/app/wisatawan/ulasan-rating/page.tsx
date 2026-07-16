"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { MapPin, Star } from "lucide-react";

type Destinasi = {
    id: string;
    nama: string;
    kategori: string;
    kota: string;
    gambar: string;
};

type RiwayatDestinasi = {
    id: string;
    rating?: number;
    ulasan?: string;
    destinasi: Destinasi;
};

export default function UlasanRatingPage() {

    const [riwayatList, setRiwayatList] = useState<RiwayatDestinasi[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");

    const [isModalOpen, setIsModalOpen] = useState(false);

    const [selectedItem, setSelectedItem] =
        useState<RiwayatDestinasi | null>(null);

    const [rating, setRating] = useState(0);

    const [ulasan, setUlasan] = useState("");

    useEffect(() => {

        // eslint-disable-next-line react-hooks/immutability
        fetchRiwayat();

    }, []);

    const fetchRiwayat = async () => {

        try {

            const userData = JSON.parse(
                localStorage.getItem("user_data") || "{}"
            );

            const res = await fetch(
                `http://localhost:8080/api/wisatawan-aktivitas/riwayat-destinasi/${userData.id}`
            );

            const data = await res.json();

            console.log("DATA RIWAYAT:", data.data);

            if (!res.ok) {
                throw new Error(data.error || "Gagal mengambil riwayat destinasi.");
            }

            setRiwayatList(data.data || []);

        } catch (err: unknown) {

            if (err instanceof Error) {
                setErrorMsg(err.message);
            } else {
                setErrorMsg("Terjadi kesalahan.");
            }

        } finally {

            setIsLoading(false);

        }

    };

    const handleReview = (item: RiwayatDestinasi) => {

        setSelectedItem(item);

        setRating(item.rating || 0);

        setUlasan(item.ulasan || "");

        setIsModalOpen(true);

    };

    const handleSubmitReview = async () => {

        if (!selectedItem) return;

        try {

            const userData = JSON.parse(
                localStorage.getItem("user_data") || "{}"
            );

            const res = await fetch(
                "http://localhost:8080/api/wisatawan-aktivitas/ulasan",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        id_wisatawan: userData.id,
                        id_destinasi: selectedItem.destinasi.id,
                        rating: rating,
                        komentar: ulasan,
                    }),
                }
            );

            const data = await res.json();

            if (!res.ok) {
                alert(data.error || "Gagal menyimpan ulasan");
                return;
            }

            alert("Ulasan berhasil disimpan");

            setIsModalOpen(false);

            fetchRiwayat();

        } catch (err) {

            console.error(err);

            alert("Terjadi kesalahan.");

        }

    };

    const handleDelete = async (riwayatID: string) => {

        if (!confirm("Yakin ingin menghapus riwayat ini?")) return;

        try {

            const res = await fetch(
                `http://localhost:8080/api/wisatawan-aktivitas/riwayat-destinasi/${riwayatID}`,
                {
                    method: "DELETE",
                }
            );

            const data = await res.json();

            if (!res.ok) {

                alert(data.error);

                return;

            }

            alert("Riwayat berhasil dihapus");

            fetchRiwayat();

        } catch (err) {

            console.error(err);

            alert("Terjadi kesalahan.");

        }

    };

    return (

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

            <h1 className="text-3xl font-bold text-slate-800">

                Ulasan & Rating

            </h1>

            <p className="text-slate-500 mt-2 mb-8">

                Berikan penilaian terhadap destinasi wisata yang pernah Anda kunjungi.

            </p>

            {isLoading && (

                <div className="text-center py-20 text-slate-500">

                    Memuat data...

                </div>

            )}

            {!isLoading && errorMsg && (

                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600">

                    {errorMsg}

                </div>

            )}

            {!isLoading &&
                !errorMsg &&
                riwayatList.length === 0 && (

                    <div className="bg-slate-50 border rounded-2xl py-20 text-center">

                        <MapPin
                            className="mx-auto mb-4 text-slate-300"
                            size={52}
                        />

                        <p className="text-slate-500">

                            Belum ada riwayat destinasi.

                        </p>

                    </div>

                )}

            {!isLoading &&
                !errorMsg &&
                riwayatList.length > 0 && (

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

                        {riwayatList.map((item) => (

                            <div
                                key={item.id}
                                className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-xl transition-all group"
                            >

                                <div className="relative h-56 bg-slate-200">

                                    <Image
                                        src={
                                            item.destinasi.gambar ||
                                            "https://placehold.co/600x400/png?text=No+Image"
                                        }
                                        alt={item.destinasi.nama}
                                        fill
                                        className="object-cover group-hover:scale-105 transition duration-500"
                                    />

                                    <div className="absolute top-4 left-4">

                                        <span className="bg-white/90 text-black backdrop-blur px-3 py-1 rounded-full text-xs font-semibold">

                                            {item.destinasi.kategori}

                                        </span>

                                    </div>

                                </div>

                                <div className="p-5 flex flex-col">

                                    <div className="text-blue-600 text-sm font-semibold mb-2">

                                        📍 {item.destinasi.kota}

                                    </div>

                                    <h2 className="text-xl font-bold text-slate-800 mb-4">

                                        {item.destinasi.nama}

                                    </h2>

                                    {item.rating ? (

                                        <div className="mb-4">

                                            <div className="flex gap-1 mb-2">

                                                {Array.from({ length: 5 }).map((_, index) => (

                                                    <Star
                                                        key={index}
                                                        size={18}
                                                        fill={
                                                            index < item.rating
                                                                ? "#facc15"
                                                                : "none"
                                                        }
                                                        className={
                                                            index < item.rating
                                                                ? "text-yellow-400"
                                                                : "text-slate-300"
                                                        }
                                                    />

                                                ))}

                                            </div>

                                            <p className="text-sm text-slate-500 italic line-clamp-2">

                                                &quot;{item.ulasan}

                                            </p>

                                        </div>

                                    ) : (

                                        <div className="mb-4">

                                            <span className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 px-3 py-2 rounded-xl text-sm font-medium">

                                                ⭐ Belum diberi ulasan

                                            </span>

                                        </div>

                                    )}

                                    <div className="flex justify-between items-center gap-3">
                                        <button
                                            onClick={() => handleReview(item)}
                                            className="mt-auto w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition"
                                        >

                                            {item.rating
                                                ? "Edit Ulasan"
                                                : "Beri Ulasan"}

                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="w-full mt-2 rounded-xl bg-red-500 py-3 text-white hover:bg-red-600 transition"
                                        >
                                            Delete
                                        </button>
                                    </div>

                                </div>

                            </div>

                        ))}

                    </div>

                )}

            {isModalOpen && selectedItem && (

                <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center">

                    <div className="bg-white rounded-2xl w-full max-w-lg p-8 shadow-2xl">

                        <h2 className="text-2xl font-bold text-slate-800 mb-2 text-center">

                            Ulasan Destinasi

                        </h2>

                        <p className="text-slate-500 mb-6 text-center">

                            {selectedItem.destinasi.nama}

                        </p>

                        {/* Rating */}

                        <div className="flex justify-center gap-2 mb-6 items-center">

                            <h1 className="text-black">Rating:</h1>

                            {Array.from({ length: 5 }).map((_, index) => (

                                <button
                                    key={index}
                                    onClick={() => setRating(index + 1)}
                                >

                                    <Star
                                        size={34}
                                        fill={
                                            index < rating
                                                ? "#facc15"
                                                : "none"
                                        }
                                        className={
                                            index < rating
                                                ? "text-yellow-400"
                                                : "text-slate-300"
                                        }
                                    />

                                </button>

                            ))}

                        </div>

                        <h1 className="text-black">Ulasan:</h1>
                        <textarea
                            rows={5}
                            value={ulasan}
                            onChange={(e) => setUlasan(e.target.value)}
                            placeholder="Bagaimana pengalaman Anda?"
                            className="w-full border rounded-xl text-slate-800  p-4 resize-none outline-none focus:ring-2 focus:ring-blue-500"
                        />

                        <div className="flex justify-end gap-3 mt-6">

                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-5 py-2 rounded-xl border border-red-500 text-red-500"
                            >
                                Batal
                            </button>

                            <button
                                onClick={handleSubmitReview}
                                className="px-5 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
                            >
                                Simpan
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>

    );

}