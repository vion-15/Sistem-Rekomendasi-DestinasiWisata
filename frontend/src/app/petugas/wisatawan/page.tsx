"use client";

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
                                    <td className="p-4">
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
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}