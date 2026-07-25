"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Map } from "lucide-react";

interface RekomendasiDestinasi {
    id?: string;
    nama: string;
    kota: string;
    kategori?: string;
    deskripsi?: string;
    similarity_score?: number;
    latitude: number;
    longitude: number;
}

export default function HasilRekomendasiPage() {
    const router = useRouter();
    const [hasilPencarian, setHasilPencarian] = useState<RekomendasiDestinasi[]>([]);
    const [searchKeyword, setSearchKeyword] = useState("");
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const cachedData = localStorage.getItem("cbf_recommendations");
        const cachedKeyword = localStorage.getItem("search_keyword");

        if (cachedData) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setHasilPencarian(JSON.parse(cachedData));
        }
        if (cachedKeyword) {
            setSearchKeyword(cachedKeyword);
        }
        setIsLoaded(true);
    }, []);

    const handleCekRute = (destinasi: RekomendasiDestinasi) => {
        localStorage.setItem("route_destination", JSON.stringify(destinasi));
        router.push("/admin/lokasi-destinasi");
    };

    if (!isLoaded) {
        return (
            <div className="flex justify-center items-center min-h-[60vh] text-gray-500 font-medium">
                <div className="animate-pulse flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Memuat hasil rekomendasi...
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8 border-b border-gray-200 pb-5">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                        Hasil Rekomendasi
                    </h1>
                    <span className="text-slate-600">Query: {searchKeyword}</span>
                </div>
            </div>

            {hasilPencarian.length === 0 ? (
                <div
                    className="text-center py-16 bg-white rounded-2xl border border-dashed 
                    border-gray-300 max-w-md mx-auto shadow-sm">
                    <span className="text-4xl block mb-3">🔍</span>
                    <h3 className="text-base font-semibold text-gray-800 mb-1">Tidak Ada Data Rekomendasi</h3>
                    <p className="text-sm text-gray-500 mb-5 px-6">
                        Silakan lakukan pencarian ulang dengan kata kunci destinasi lainnya.
                    </p>
                    <button
                        onClick={() => router.push("/admin/pencarian")}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 
                        rounded-lg transition-colors shadow-sm"
                    >
                        Kembali Ke Pencarian
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {hasilPencarian.map((destinasi, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col justify-between 
                            shadow-sm hover:shadow-md transition-all duration-200 group"
                        >
                            <div>
                                <div className="flex justify-between items-start gap-2 mb-4">
                                    <div className="flex flex-col gap-2">
                                        <span 
                                            className="bg-gray-100 text-gray-700 text-xs font-semibold px-2.5 py-1 
                                            rounded-md uppercase tracking-wider border border-gray-200/60">
                                            {destinasi.kategori}
                                        </span>
                                        <span 
                                            className="bg-orange-300 text-white text-xs font-semibold px-2.5 py-1 
                                            rounded-md uppercase tracking-wider border border-gray-200/60">
                                            {destinasi.kota}
                                        </span>
                                    </div>
                                    {destinasi.similarity_score !== undefined && (
                                        <div className="text-right bg-blue-50/50 border border-blue-100 rounded-lg px-2 py-1">
                                            <div className="text-[9px] font-bold text-blue-500 uppercase tracking-wider">
                                                Similarity
                                            </div>
                                            <div className="text-xs font-black text-blue-700">
                                                {Number(destinasi.similarity_score).toFixed(4)}
                                                <span className="text-[10px] text-blue-600 font-medium ml-0.5">
                                                    ({(Number(destinasi.similarity_score) * 100).toFixed(0)}%)
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <h3 
                                    className="text-lg font-bold text-gray-900 group-hover:text-blue-600 
                                    transition-colors mb-2 line-clamp-1">
                                    {destinasi.nama}
                                </h3>

                                <p className="text-sm text-gray-600 line-clamp-4 leading-relaxed mb-6">
                                    {destinasi.deskripsi}
                                </p>
                            </div>

                            <div className="pt-4 border-t border-gray-100">
                                <button
                                    onClick={() => handleCekRute(destinasi)}
                                    className="w-full flex items-center justify-center gap-2 bg-emerald-600 
                                    hover:bg-emerald-700 text-white font-semibold py-2.5 px-4 rounded-xl shadow-sm 
                                    hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200"
                                >
                                    <Map size={18} />
                                    Lihat Rute
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}