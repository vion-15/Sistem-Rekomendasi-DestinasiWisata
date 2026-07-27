"use client";

import { useEffect, useState } from "react";
import { Search, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

type Pencarian = {
    id: string;
    keyword: string;
    created_at: string;
};

type UserData = {
    id: string;
    username: string;
    email: string;
};

export default function PencarianWisatawanPage() {

    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [pencarianList, setPencarianList] = useState<Pencarian[]>([]);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const user = localStorage.getItem("user_data");
        if (user) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setUserData(JSON.parse(user));
        }
    }, []);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();

        setIsLoading(true);
        try {
            const res = await fetch(
                "http://localhost:8080/api/wisatawan-aktivitas/cari",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        id_wisatawan: userData?.id,
                        keyword: searchQuery,
                    }),
                }
            );

            const data = await res.json();

            if (!res.ok) {
                alert(data.error || "Gagal mencari destinasi.");
                return;
            }
            setSearchQuery("");
            router.push("/wisatawan/hasil-rekomendasi");
        } catch (error) {
            console.error(error);
            alert("Terjadi kesalahan.");
        }
    };

    const handleDelete = async (id: string) => {
        const confirmDelete = window.confirm("Apakah anda yakin ingin menghapus data ini ?");

        if (!confirmDelete) return;

        try {
            const res = await fetch(`http://localhost:8080/api/wisatawan-aktivitas/pencarian/${id}`, {
                method: "DELETE",
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Gagal menghapus data");
            }

            fetchPencarian();
            alert("Data berhasil dihapus.");

        } catch (error) {
            console.error(error);

            if (error instanceof Error) {
                alert(error.message);
            } else {
                alert("Terjadi kesalahan.");
            }
        }
    };

    const fetchPencarian = async () => {

        try {
            const userData = JSON.parse(
                localStorage.getItem("user_data") || "{}"
            );
            const res = await fetch(
                `http://localhost:8080/api/wisatawan-aktivitas/pencarian/${userData.id}`
            );
            const data = await res.json();
            if (res.ok) {
                setPencarianList(data.data || []);
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchPencarian();
    }, []);

    return (
        <div className="animate-in fade-in duration-300">
            <div className="bg-linear-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 sm:p-12 mb-10 shadow-lg 
            relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 
                rounded-full blur-2xl pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-blue-400/20 rounded-full blur-2xl 
                pointer-events-none"></div>
                <div className="relative z-10">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-8 tracking-tight">
                        Ayo Kita Mau Cari Apa?
                    </h1>
                    <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 items-center">
                        <div className="relative flex-1 w-full">
                            <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                                <Search className="text-slate-400" size={20} />
                            </div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Cari Destinasi Yang Sesuai dengan Mu....."
                                className="w-full pl-14 pr-6 py-4 rounded-2xl border-0 text-slate-800 placeholder:text-slate-400 
                                focus:outline-none focus:ring-4 focus:ring-blue-400/30 bg-white shadow-inner transition-all"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full sm:w-auto px-10 py-4 bg-white text-blue-700 font-bold text-lg rounded-2xl 
                            hover:bg-slate-50 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 disabled:opacity-60"
                        >
                            {isLoading ? "Mencari..." : "Cari"}
                        </button>
                    </form>
                </div>
            </div>

            <div>
                <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                    Pencarian
                </h2>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="p-5 font-semibold text-slate-600 w-16 text-center">No</th>
                                <th className="p-5 font-semibold text-slate-600">Keyword</th>
                                <th className="p-5 font-semibold text-slate-600 w-32 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {pencarianList.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="p-10 text-center text-slate-500 font-medium">
                                        <div className="flex flex-col items-center gap-2">
                                            <Search size={32} className="text-slate-300" />
                                            Belum ada riwayat pencarian.
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                pencarianList.map((item, index) => (
                                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="p-5 text-slate-500 text-center font-medium">
                                            {index + 1}
                                        </td>
                                        <td className="p-5 text-slate-800 font-medium">
                                            {item.keyword}
                                        </td>
                                        <td className="p-5 text-center">
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="flex items-center justify-center gap-1.5 w-full bg-red-50 text-red-600 
                                                hover:bg-red-500 hover:text-white px-4 py-2 rounded-xl text-sm font-semibold 
                                                transition-all duration-300"
                                            >
                                                <Trash2 size={16} />
                                                Delete
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