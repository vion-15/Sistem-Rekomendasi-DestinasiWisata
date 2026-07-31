"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { MapPin, Star } from "lucide-react";
import {
    getLanguage,
    Language,
} from "@/helpers/language";

import { t } from "@/helpers/translate";

interface Destinasi {
    id: string;

    nama: string;
    nama_en: string;

    kategori: string;
    kategori_en: string;

    deskripsi: string;
    deskripsi_en: string;

    kota?: string;
    kota_en?: string;

    gambar?: string;
}

type UlasanRating = {
    id: string;
    rating?: number;
    ulasan?: string;
    tanggal_ulasan?: string;
    destinasi: Destinasi;
};

export default function UlasanRatingPage() {

    const [riwayatList, setRiwayatList] = useState<UlasanRating[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] =
        useState<UlasanRating | null>(null);
    const [rating, setRating] = useState(0);
    const [ulasan, setUlasan] = useState("");
    const [language, setCurrentLanguage] =
        useState<Language>("id");

    const lang = t(language);

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
                `${process.env.NEXT_PUBLIC_API_URL}/api/wisatawan-aktivitas/riwayat-destinasi/${userData.id}`
            );
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || lang.reviewFetchFailed);
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

    const handleReview = (item: UlasanRating) => {
        setSelectedItem(item);
        setRating(item.rating ?? 0);
        setUlasan(item.ulasan ?? "");
        setIsModalOpen(true);
    };

    const handleSubmitReview = async () => {
        if (!selectedItem) return;
        try {
            const userData = JSON.parse(
                localStorage.getItem("user_data") || "{}"
            );
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/wisatawan-aktivitas/ulasan`,
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
                alert(data.error || lang.reviewSaveFailed);
                return;
            }

            alert(lang.reviewSaveSuccess);
            setIsModalOpen(false);
            setRating(0);
            setUlasan("");
            fetchRiwayat();
        } catch (err) {
            console.error(err);
            alert("Terjadi kesalahan.");
        }
    };

    const handleDelete = async (riwayatID: string) => {
        if (!confirm(lang.reviewDeleteConfirm)) return;
        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/wisatawan-aktivitas/riwayat-destinasi/${riwayatID}`,
                {
                    method: "DELETE",
                }
            );
            const data = await res.json();
            if (!res.ok) {
                alert(data.error);
                return;
            }
            alert(lang.reviewDeleteSuccess);
            fetchRiwayat();
        } catch (err) {
            console.error(err);
            alert("Terjadi kesalahan.");
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-slate-800">
                {lang.reviewTitle}
            </h1>
            <p className="text-slate-500 mt-2 mb-8">
                {lang.reviewDescription}
            </p>

            {isLoading && (
                <div className="text-center py-20 text-slate-500">
                    {lang.reviewLoading}
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
                            {lang.reviewEmpty}
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
                                className="bg-white rounded-2xl shadow-sm border border-slate-200 
                                overflow-hidden hover:shadow-xl transition-all group"
                            >
                                <div className="relative h-56 bg-slate-200">
                                    <Image
                                        src={
                                            item.destinasi.gambar ||
                                            "https://placehold.co/600x400/png?text=No+Image"
                                        }
                                        alt={
                                            language === "id"
                                                ? item.destinasi.nama
                                                : item.destinasi.nama_en
                                        }
                                        fill
                                        className="object-cover group-hover:scale-105 transition duration-500"
                                    />
                                    <div className="absolute top-4 left-4">
                                        <span className="bg-white/90 text-black backdrop-blur px-3 py-1 rounded-full 
                                        text-xs font-semibold">
                                            {
                                                language === "id"
                                                    ? item.destinasi.kategori
                                                    : item.destinasi.kategori_en
                                            }
                                        </span>
                                    </div>
                                </div>

                                <div className="p-5 flex flex-col">
                                    <div className="text-blue-600 text-sm font-semibold mb-2">
                                        📍 {
                                            language === "id"
                                                ? item.destinasi.kota
                                                : item.destinasi.kota_en
                                        }
                                    </div>

                                    <h2 className="text-xl font-bold text-slate-800 mb-4">
                                        {
                                            language === "id"
                                                ? item.destinasi.nama
                                                : item.destinasi.nama_en
                                        }
                                    </h2>

                                    <div className="mt-4 space-y-3">

                                        {item.rating !== undefined ? (
                                            <>
                                                <div className="flex items-center gap-1">
                                                    {Array.from({ length: 5 }).map((_, index) => (
                                                        <Star
                                                            key={index}
                                                            size={18}
                                                            fill={
                                                                index < (item.rating ?? 0)
                                                                    ? "#facc15"
                                                                    : "none"
                                                            }
                                                            className={
                                                                index < (item.rating ?? 0)
                                                                    ? "text-yellow-400"
                                                                    : "text-slate-300"
                                                            }
                                                        />
                                                    ))}
                                                </div>

                                                <div>
                                                    <p className="text-xs font-semibold uppercase text-slate-400 mb-1">
                                                        {lang.reviewYourReview}
                                                    </p>

                                                    <p className="text-sm italic text-slate-600 line-clamp-2">
                                                        &quot;{item.ulasan}&quot;
                                                    </p>
                                                </div>

                                                {item.tanggal_ulasan && (
                                                    <p className="text-xs text-slate-400">
                                                        {lang.reviewReviewedOn}
                                                        {new Date(
                                                            item.tanggal_ulasan
                                                        ).toLocaleDateString("id-ID")}
                                                    </p>
                                                )}
                                            </>
                                        ) : (
                                            <div
                                                className="inline-flex items-center gap-2
                                                bg-yellow-50
                                                text-yellow-700
                                                px-3 py-1
                                                rounded-full
                                                text-sm"
                                            >
                                                <span
                                                    className="
                                                    inline-flex
                                                    items-center
                                                    rounded-full
                                                    bg-amber-100
                                                    text-amber-700
                                                    px-3
                                                    py-1
                                                    text-sm
                                                    font-medium"
                                                >
                                                    ⭐ {lang.reviewNotReviewed}
                                                </span>
                                            </div>
                                        )}

                                    </div>

                                    <div className="flex gap-3 mt-5">

                                        <button
                                            onClick={() => handleReview(item)}
                                            className="flex-1 rounded-xl
                                            bg-blue-600
                                            py-3
                                            text-white
                                            font-semibold
                                            hover:bg-blue-700
                                            transition"
                                        >
                                            {item.rating !== undefined
                                                ? lang.reviewEdit
                                                : lang.reviewGive}
                                        </button>

                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="flex-1 rounded-xl
                                            bg-red-500
                                            py-3
                                            text-white
                                            font-semibold
                                            hover:bg-red-600
                                            transition"
                                        >
                                            {lang.reviewDelete}
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
                            {lang.reviewModalTitle}
                        </h2>
                        <p className="text-slate-500 mb-6 text-center">
                            {
                                language === "id"
                                    ? selectedItem.destinasi.nama
                                    : selectedItem.destinasi.nama_en
                            }
                        </p>

                        {/* Rating */}
                        <div className="flex justify-center gap-2 mb-6 items-center">
                            <h1 className="text-black">{lang.reviewRating}</h1>
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

                        <h1 className="text-black">{lang.reviewComment}</h1>
                        <textarea
                            rows={5}
                            value={ulasan}
                            onChange={(e) => setUlasan(e.target.value)}
                            placeholder={lang.reviewPlaceholder}
                            className="w-full border rounded-xl text-slate-800  p-4 resize-none outline-none focus:ring-2 focus:ring-blue-500"
                        />

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-5 py-2 rounded-xl border border-red-500 text-red-500"
                            >
                                {lang.reviewCancel}
                            </button>
                            <button
                                onClick={handleSubmitReview}
                                className="px-5 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
                            >
                                {lang.reviewSave}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}