"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PencarianPage() {
    const router = useRouter();
    const [keyword, setKeyword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [riwayatPencarian, setRiwayatPencarian] = useState<string[]>([]);

    useEffect(() => {
        const savedHistory = localStorage.getItem("petugas_search_history");
        if (savedHistory) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setRiwayatPencarian(JSON.parse(savedHistory));
        } else {
            setRiwayatPencarian([]);
        }
    }, []);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!keyword.trim()) return;

        setIsLoading(true);

        try {
            const rawData = localStorage.getItem("user_data");
            const userData = rawData ? JSON.parse(rawData) : null;

            const res = await fetch("http://localhost:8080/api/petugas-aktivitas/cari", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id_petugas: userData?.id || "dummy-petugas-id",
                    keyword: keyword
                })
            });

            const data = await res.json();

            if (res.ok) {
                const recommendations = data.recommendations || data || [];
                localStorage.setItem("cbf_recommendations_petugas", JSON.stringify(recommendations));
                localStorage.setItem("search_keyword_petugas", keyword);

                const sisaRiwayat = riwayatPencarian.filter(item => item !== keyword);
                const riwayatBaru = [keyword, ...sisaRiwayat];

                setRiwayatPencarian(riwayatBaru);
                localStorage.setItem("petugas_search_history", JSON.stringify(riwayatBaru));

                router.push("/petugas/hasil-rekomendasi");
            } else {
                alert(data.error || "Gagal melakukan pencarian");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Terjadi kesalahan koneksi ke server.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleDeleteHistory = (keywordTerpilih: string) => {
        const riwayatUpdate = riwayatPencarian.filter(item => item !== keywordTerpilih);
        setRiwayatPencarian(riwayatUpdate);
        localStorage.setItem("petugas_search_history", JSON.stringify(riwayatUpdate));
    };

    return (
        <div className="p-4 max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Pencarian</h1>
            </div>

            <div className="animate-in fade-in duration-300">
                <form onSubmit={handleSearch} className="mb-6">
                    <div className="flex gap-4">
                        <div className="flex-1 relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                            <input 
                                type="text" placeholder="Cari destinasi wisata..." 
                                value={keyword} onChange={(e) => setKeyword(e.target.value)} 
                                disabled={isLoading} 
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded outline-none focus:ring-1 
                                focus:ring-gray-800 text-slate-800 placeholder:text-slate-400 disabled:bg-gray-100" />
                        </div>
                        <button type="submit" disabled={isLoading} 
                        className="bg-white border border-gray-300 hover:bg-gray-50 
                        text-gray-800 font-medium px-8 rounded transition-colors shadow-sm">
                            {isLoading ? "Mencari..." : "Cari"}
                        </button>
                    </div>
                </form>

                <h2 className="text-xl font-semibold text-gray-800 mb-4">Tabel Pencarian</h2>
                <div className="bg-white border border-gray-200 overflow-hidden rounded-xl shadow-sm">
                    <table className="w-full border-collapse text-left">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="p-4 font-semibold text-gray-600 w-20">No</th>
                                <th className="p-4 font-semibold text-gray-600">Keyword</th>
                                <th className="p-4 font-semibold text-gray-600 text-center w-40">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {riwayatPencarian.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="p-4 text-center text-gray-400 text-sm">
                                        Belum ada riwayat pencarian.
                                    </td>
                                </tr>
                            ) : (
                                riwayatPencarian.map((item, idx) => (
                                    <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                        <td className="p-4 text-gray-700">{idx + 1}</td>
                                        <td className="p-4 text-gray-700">{item}</td>
                                        <td className="p-4 text-center">
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteHistory(item)}
                                                className="text-red-500 hover:text-red-700 font-medium transition-colors"
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
            </div>
        </div>
    );
}