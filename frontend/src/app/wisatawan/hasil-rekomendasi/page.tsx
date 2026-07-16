"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import { useRouter } from "next/navigation";

type Destinasi = {
    id: string;
    nama: string;
    deskripsi: string;
    kategori: string;
    gambar: string;
    kota: string;
    latitude: number;
    longitude: number;
};

type HasilRekomendasi = {
    ID: string;
    SimilarityScore: number;
    Destinasi: Destinasi;
};

export default function HasilRekomendasiPage() {

    const [hasilList, setHasilList] = useState<HasilRekomendasi[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");
    const router = useRouter();

    const fetchHasil = async () => {

        try {

            const userData = JSON.parse(
                localStorage.getItem("user_data") || "{}"
            );

            const res = await fetch(
                `http://localhost:8080/api/wisatawan-aktivitas/hasil-rekomendasi/${userData.id}`
            );

            const data = await res.json();

            console.log(JSON.stringify(data.data[0], null, 2));

            if (!res.ok) {
                throw new Error(data.error || "Gagal mengambil hasil rekomendasi");
            }

            setHasilList(data.data || []);

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

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchHasil();
    }, []);

    const handleCekRute = async (item: HasilRekomendasi) => {

        try {

            const userData = JSON.parse(
                localStorage.getItem("user_data") || "{}"
            );

            const res = await fetch(
                "http://localhost:8080/api/wisatawan-aktivitas/riwayat-destinasi",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        id_wisatawan: userData.id,
                        id_destinasi: item.Destinasi.id,
                    }),
                }
            );

            const data = await res.json();

            if (!res.ok) {
                alert(data.error || "Gagal menyimpan riwayat destinasi.");
                return;
            }

            // Simpan destinasi yang dipilih
            localStorage.setItem(
                "route_destination",
                JSON.stringify({
                    id: item.Destinasi.id,
                    nama: item.Destinasi.nama,
                    kategori: item.Destinasi.kategori,
                    deskripsi: item.Destinasi.deskripsi,
                    latitude: item.Destinasi.latitude,
                    longitude: item.Destinasi.longitude,
                    kota: item.Destinasi.kota,
                    gambar: item.Destinasi.gambar,
                    similarity_score: item.SimilarityScore,
                })
            );

            // Pindah halaman
            router.push("/wisatawan/lokasi-destinasi");

        } catch (err) {

            console.error(err);
            alert("Terjadi kesalahan.");

        }

    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-300">

            <h2 className="text-2xl font-bold text-slate-800 mb-8">
                Hasil Rekomendasi Destinasi
            </h2>

            {isLoading && (

                <div className="flex flex-col items-center justify-center py-20 text-slate-500">

                    <svg
                        className="animate-spin mb-4 h-8 w-8 text-slate-400"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        />

                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373
                            0 0 5.373 0 12h4zm2
                            5.291A7.962 7.962 0 014
                            12H0c0 3.042 1.135
                            5.824 3 7.938l3-2.647z"
                        />

                    </svg>

                    <p>Memuat hasil rekomendasi...</p>

                </div>

            )}

            {!isLoading && errorMsg && (

                <div className="bg-red-50 text-red-600 rounded-xl p-4">

                    {errorMsg}

                </div>

            )}

            {!isLoading &&
                !errorMsg &&
                hasilList.length === 0 && (

                    <div className="text-center py-20 bg-slate-50 rounded-2xl border">

                        <MapPin className="mx-auto h-12 w-12 text-slate-300 mb-4" />

                        <p className="text-slate-500">
                            Belum ada hasil rekomendasi.
                        </p>

                    </div>

                )}

            {!isLoading &&
                !errorMsg &&
                hasilList.length > 0 && (

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                        {hasilList.map((item) => (

                            <div
                                key={item.ID}
                                className="bg-white rounded-2xl overflow-hidden shadow-sm border hover:shadow-xl transition-all group"
                            >

                                <div className="relative h-52">

                                    <Image
                                        src={
                                            item.Destinasi.gambar ||
                                            "https://placehold.co/600x400/png?text=No+Image"
                                        }
                                        alt={item.Destinasi.nama}
                                        fill
                                        className="object-cover text-black group-hover:scale-105 transition duration-500"
                                    />

                                    <div className="absolute top-3 left-3 flex gap-2 flex-wrap">

                                        <span className="bg-white/90 px-3 text-black py-1 rounded-full text-xs font-semibold">

                                            {item.Destinasi.kategori}

                                        </span>

                                        <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">

                                            {(item.SimilarityScore * 100).toFixed(2)}%

                                        </span>

                                    </div>

                                </div>

                                <div className="p-5 flex flex-col">

                                    <div className="text-blue-600 text-sm font-semibold mb-2">

                                        📍 {item.Destinasi.kota}

                                    </div>

                                    <h3 className="font-bold text-lg text-black mb-2">

                                        {item.Destinasi.nama}

                                    </h3>

                                    <p className="text-slate-500 text-sm line-clamp-3 flex-1">

                                        {item.Destinasi.deskripsi}

                                    </p>

                                    <button
                                        onClick={() => handleCekRute(item)}
                                        className="mt-5 w-full py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition"
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