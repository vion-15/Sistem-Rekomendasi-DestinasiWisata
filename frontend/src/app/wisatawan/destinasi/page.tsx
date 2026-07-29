"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader, MapPin, Search } from "lucide-react";
import {
    getLanguage,
    setLanguage as saveLanguage,
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

    latitude: number;
    longitude: number;

    gambar?: string;

    similarity_score?: number;
}

export default function DestinasiWisataPage() {
    const router = useRouter();
    const [destinasiList, setDestinasiList] = useState<Destinasi[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const PER_PAGE = 9;

    const [language, setCurrentLanguage] = useState<Language>("id");

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

    console.log(destinasiList)

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchDestinasi();
    }, []);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCurrentPage(1);
    }, [search]);

    const filteredDestinasi = destinasiList.filter((d) => {
        const nama =
            language === "id"
                ? d.nama
                : d.nama_en;

        return nama.toLowerCase().includes(search.toLowerCase());
    });

    const totalPages = Math.ceil(filteredDestinasi.length / PER_PAGE);

    const displayedDestinasi = filteredDestinasi.slice(
        (currentPage - 1) * PER_PAGE,
        currentPage * PER_PAGE
    );

    const maxVisiblePages = 5;

    let startPage = Math.max(
        1,
        currentPage - Math.floor(maxVisiblePages / 2)
    );

    let endPage = startPage + maxVisiblePages - 1;

    if (endPage > totalPages) {
        endPage = totalPages;
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    const visiblePages = Array.from(
        { length: endPage - startPage + 1 },
        (_, i) => startPage + i
    );

    const handleCekRute = (dest: Destinasi) => {
        localStorage.setItem("route_destination", JSON.stringify(dest));
        router.push("/wisatawan/lokasi-destinasi");
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-300">
            <h2 className="text-xl md:text-2xl font-semibold text-slate-900 mb-8">
                {lang.destinationWisatawanTitle}
            </h2>

            <div className="mb-8 w-full">
                <div className="relative w-full">
                    <Search
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                        size={18}
                    />

                    <input
                        type="text"
                        placeholder={lang.destinationSearchPlaceholder}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-white
                            py-3 pl-12 pr-4 text-sm shadow-sm
                            outline-none transition-all
                            focus:border-blue-500
                            focus:ring-4 focus:ring-blue-100 text-slate-800"
                    />
                </div>
            </div>

            {isLoading && (
                <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                    <Loader />
                    <p className="font-medium text-sm">{lang.destinationLoading}</p>
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
                    <p className="text-slate-500 font-medium">{lang.destinationEmpty}</p>
                </div>
            )}

            {!isLoading && !errorMsg && destinasiList.length > 0 && (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {displayedDestinasi.map((d) => (
                            <div key={d.id} className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all group flex flex-col">

                                <div className="h-48 relative overflow-hidden bg-slate-200">
                                    <Image
                                        src={d.gambar || "https://placehold.co/600x400/png?text=No+Image"}
                                        alt={
                                            language === "id"
                                                ? d.nama
                                                : d.nama_en
                                        }
                                        fill
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                                        <span className="bg-white/90 backdrop-blur text-slate-800 text-xs 
                                    font-bold px-3 py-1.5 rounded-full shadow-sm">
                                            {
                                                language === "id"
                                                    ? d.kategori
                                                    : d.kategori_en
                                            }
                                        </span>
                                        {/* Label Dinamis AI (Opsional jika ada data skor) */}
                                        {d.similarity_score === 1.0 ? (
                                            <span className="bg-amber-100/90 backdrop-blur text-amber-700 text-xs font-bold 
                                        px-3 py-1.5 rounded-full shadow-sm">
                                                🔥 {lang.destinationPopular}
                                            </span>
                                        ) : d.similarity_score !== undefined ? (
                                            <span className="bg-emerald-100/90 backdrop-blur text-emerald-700 text-xs font-bold px-3 
                                        py-1.5 rounded-full shadow-sm">
                                                ✨ {(d.similarity_score * 100).toFixed(0)}% Match
                                            </span>
                                        ) : null}
                                    </div>
                                </div>

                                <div className="p-5 flex-1 flex flex-col">
                                    <div className="text-xs font-semibold text-blue-600 mb-2 uppercase tracking-wider">
                                        📍 {
                                            language === "id"
                                                ? d.kota || lang.locationAvailable
                                                : d.kota_en || lang.locationAvailable
                                        }
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-800 mb-2 line-clamp-1">{
                                        language === "id"
                                            ? d.nama
                                            : d.nama_en
                                    }</h3>
                                    <p className="text-slate-500 text-sm line-clamp-3 mb-4 flex-1">
                                        {
                                            language === "id"
                                                ? d.deskripsi
                                                : d.deskripsi_en
                                        }
                                    </p>

                                    <button
                                        onClick={() => handleCekRute(d)}
                                        className="w-full block text-center py-2.5 bg-slate-50 hover:bg-blue-50 
                                    text-slate-700 hover:text-blue-700 font-semibold rounded-xl transition-colors border 
                                    border-slate-200 hover:border-blue-200"
                                    >
                                        {lang.destinationRoute}
                                    </button>
                                </div>

                            </div>
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-2 mt-8 flex-wrap">
                            <button
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage((prev) => prev - 1)}
                                className="px-4 py-2 rounded-lg border disabled:opacity-50 text-slate-800"
                            >
                                {lang.destinationPrevious}
                            </button>

                            {visiblePages.map((page) => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`px-4 py-2 rounded-lg border transition-colors ${currentPage === page
                                        ? "bg-blue-600 text-white border-blue-600"
                                        : "bg-white hover:bg-slate-100 text-gray-600"
                                        }`}
                                >
                                    {page}
                                </button>
                            ))}

                            <button
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage((prev) => prev + 1)}
                                className="px-4 py-2 rounded-lg border disabled:opacity-50 text-slate-800"
                            >
                                {lang.destinationNext}
                            </button>
                        </div>
                    )}
                </>
            )}

        </div>
    );
}