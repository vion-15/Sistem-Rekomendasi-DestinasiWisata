"use client";

import { TriangleAlert } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";

type Wisatawan = {
    id: string;
    username: string;
    email: string;
    alamat: string;
    foto: string;
    created_at: string;
};

export default function WisatawanPage() {
    const [wisatawanList, setWisatawanList] = useState<Wisatawan[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchWisatawan = async () => {
        try {
            const res = await fetch("http://localhost:8080/api/wisatawan/");
            const data = await res.json();
            if (res.ok) {
                setWisatawanList(data.data || []);
            }
        } catch (error) {
            console.error("Network error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchWisatawan();
    }, []);

    const handleDelete = async () => {
        if (!deleteId) return;

        setIsDeleting(true);

        try {
            const res = await fetch(
                `http://localhost:8080/api/wisatawan/${deleteId}`,
                {
                    method: "DELETE",
                }
            );

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Gagal menghapus wisatawan");
            }

            setDeleteId(null);
            fetchWisatawan();
        } catch (err: unknown) {
            if (err instanceof Error) {
                alert(err.message);
            } else {
                alert("Terjadi kesalahan");
            }
        } finally {
            setIsDeleting(false);
        }
    };

    const formatDate = (dateString: string) => {
        const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('id-ID', options);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Wisatawan</h1>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="p-4 font-semibold text-gray-600">No</th>
                            <th className="p-4 font-semibold text-gray-600">Foto</th>
                            <th className="p-4 font-semibold text-gray-600">Username</th>
                            <th className="p-4 font-semibold text-gray-600">Email</th>
                            <th className="p-4 font-semibold text-gray-600">Tanggal</th>
                            <th className="p-4 font-semibold text-gray-600">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan={4} className="p-4 text-center text-gray-500">Memuat data...</td>
                            </tr>
                        ) : wisatawanList.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="p-4 text-center text-gray-500">
                                    Belum ada wisatawan yang mendaftar.
                                </td>
                            </tr>
                        ) : (
                            wisatawanList.map((w, index) => (
                                <tr key={w.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                    <td className="p-4 text-gray-600">{index + 1}</td>
                                    <td>
                                        <Image
                                            src={w.foto || "image/default-avatar.png"}
                                            alt={`Foto ${w.username}`}
                                            height={40}
                                            width={40}
                                            className="h-10 w-10 rounded-full object-cover border border-gray-200"
                                        />
                                    </td>
                                    <td className="p-4 text-gray-600">{w.username}</td>
                                    <td className="p-4 text-gray-600">{w.email}</td>
                                    <td className="p-4 text-gray-600">{formatDate(w.created_at)}</td>
                                    <td className="p-4">
                                        <button
                                            onClick={() => setDeleteId(w.id)}
                                            className="text-red-500 hover:text-red-700 mx-2 font-medium transition-colors"
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

            {deleteId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">

                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                                <TriangleAlert className="text-red-600" />
                            </div>

                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">
                                    Hapus Data Wisatawan
                                </h2>

                                <p className="mt-1 text-sm text-gray-600">
                                    Apakah Anda yakin ingin menghapus data wisatawan ini?
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