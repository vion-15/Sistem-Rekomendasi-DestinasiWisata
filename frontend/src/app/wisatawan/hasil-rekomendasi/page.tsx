"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Loader, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import {
    getLanguage,
    Language,
} from "@/helpers/language";

import { t } from "@/helpers/translate";

type Destinasi = {
    id: string;

    nama: string;
    nama_en: string;

    deskripsi: string;
    deskripsi_en: string;

    kategori: string;
    kategori_en: string;

    kota: string;
    kota_en: string;

    gambar: string;

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
    const [language, setCurrentLanguage] =
        useState<Language>("id");

    const lang = t(language);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCurrentLanguage(getLanguage());

        const handleLanguageChange = () => {
            setCurrentLanguage(getLanguage());
        };

        window.addEventListener(
            "languageChanged",
            handleLanguageChange
        );

        return () => {
            window.removeEventListener(
                "languageChanged",
                handleLanguageChange
            );
        };
    }, []);

    const fetchHasil = async () => {
        try {
            const userData = JSON.parse(
                localStorage.getItem("user_data") || "{}"
            );
            const res = await fetch(
                `http://localhost:8080/api/wisatawan-aktivitas/hasil-rekomendasi/${userData.id}`
            );
            const data = await res.json();
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
                alert(data.error || lang.saveHistoryFailed);
                return;
            }
            localStorage.setItem(
                "route_destination",
                JSON.stringify({
                    id: item.Destinasi.id,

                    nama: item.Destinasi.nama,
                    nama_en: item.Destinasi.nama_en,

                    kategori: item.Destinasi.kategori,
                    kategori_en: item.Destinasi.kategori_en,

                    deskripsi: item.Destinasi.deskripsi,
                    deskripsi_en: item.Destinasi.deskripsi_en,

                    kota: item.Destinasi.kota,
                    kota_en: item.Destinasi.kota_en,

                    latitude: item.Destinasi.latitude,
                    longitude: item.Destinasi.longitude,

                    gambar: item.Destinasi.gambar,

                    similarity_score: item.SimilarityScore,
                })
            );
            router.push("/wisatawan/lokasi-destinasi");
        } catch (err) {
            console.error(err);
            alert(lang.generalError);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-300">
            <h2 className="text-2xl font-bold text-slate-800 mb-8">
                {lang.recommendationTitle}
            </h2>

            {isLoading && (
                <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                    <Loader />
                    <p>{lang.recommendationLoading}</p>
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
                            {lang.recommendationEmpty}
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
                                            {language === "id"
                                                ? item.Destinasi.kategori
                                                : item.Destinasi.kategori_en}
                                        </span>
                                        <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">
                                            {(item.SimilarityScore * 100).toFixed(2)}%
                                        </span>
                                    </div>
                                </div>

                                <div className="p-5 flex flex-col">
                                    <div className="text-blue-600 text-sm font-semibold mb-2">
                                        📍 {
                                            language === "id"
                                                ? item.Destinasi.kota || lang.recommendationLocationAvailable
                                                : item.Destinasi.kota_en || lang.recommendationLocationAvailable
                                        }
                                    </div>
                                    <h3 className="font-bold text-lg text-black mb-2">
                                        {language === "id"
                                            ? item.Destinasi.nama
                                            : item.Destinasi.nama_en}
                                    </h3>
                                    <p className="text-slate-500 text-sm line-clamp-3 flex-1">
                                        {language === "id"
                                            ? item.Destinasi.deskripsi
                                            : item.Destinasi.deskripsi_en}
                                    </p>

                                    <button
                                        onClick={() => handleCekRute(item)}
                                        className="mt-5 w-full py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition"
                                    >
                                        {lang.recommendationRoute}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
        </div>
    );
}