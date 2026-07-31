"use client";

import { useState, useEffect } from "react";
import { TriangleAlert } from "lucide-react";
import toast from "react-hot-toast";

interface Laporan {
    id: string;
    jenis_laporan: string;
    periode: string;
    created_at: string;
}

export default function LaporanPage() {
    const [laporanList, setLaporanList] = useState<Laporan[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchLaporan = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/petugas-laporan`);
            if (res.ok) {
                const data = await res.json();
                setLaporanList(data.data || []);
            }
        } catch (error) {
            console.error("Gagal mengambil data laporan:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchLaporan();
    }, []);

    const handleDelete = async () => {
        if (!deleteId) return;

        setIsDeleting(true);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/petugas-laporan/${deleteId}`, {
                method: "DELETE",
            });

            if (res.ok) {
                toast.success("Laporan berhasil dihapus");
                setDeleteId(null)
                fetchLaporan(); // Refresh tabel setelah menghapus
            } else {
                toast.error("Gagal menghapus laporan");
            }
        } catch (error) {
            console.error("Error:", error);
            toast.error("Terjadi kesalahan pada server");
        } finally {
            // 2. KUNCI UTAMA: Taruh di blok finally agar selalu tereksekusi!
            setIsDeleting(false);
        }
    };

    const handleDownload = async (id: string, jenis: string, periode: string) => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/petugas-laporan/${id}/download`, {
                method: 'GET',
            });

            if (res.ok) {
                const blob = await res.blob();
                
                // Buat URL sementara untuk file tersebut
                const url = window.URL.createObjectURL(blob);
                
                // Buat elemen <a> tersembunyi untuk memicu unduhan secara paksa
                const a = document.createElement('a');
                a.href = url;
                // Hilangkan spasi pada nama file, misal: Laporan_Data_Pencarian_Juli_2026.csv
                a.download = `Laporan_${jenis.replace(/\s+/g, '_')}_${periode.replace(/\s+/g, '_')}.csv`;
                document.body.appendChild(a);
                a.click(); // Trigger klik
                
                // Bersihkan kembali elemen setelah selesai
                a.remove();
                window.URL.revokeObjectURL(url); 
            } else {
                const data = await res.json();
                toast.error("Gagal mengunduh: " + data.error);
            }
        } catch (error) {
            console.error("Error downloading file:", error);
            toast.error("Terjadi kesalahan koneksi saat mencoba mengunduh file.");
        }
    };

    // Format tanggal menjadi DD-MM-YYYY
    const formatTanggal = (isoString: string) => {
        const date = new Date(isoString);
        return `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
    };

    return (
        <div className="p-4 max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Laporan</h1>
            <div className="bg-white border border-gray-200 overflow-hidden rounded shadow-sm">
                <table className="w-full border-collapse text-left">
                    <thead>
                        <tr className="bg-white border-b border-gray-300">
                            <th className="p-4 font-semibold text-gray-800 w-16 text-center">No</th>
                            <th className="p-4 font-semibold text-gray-800">Nama Laporan</th>
                            <th className="p-4 font-semibold text-gray-800 w-40 text-center">Tanggal</th>
                            <th className="p-4 font-semibold text-gray-800 w-56 text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan={4} className="p-8 text-center text-gray-500">
                                    Memuat data laporan...
                                </td>
                            </tr>
                        ) : laporanList.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="p-8 text-center text-gray-500">
                                    Belum ada data laporan yang dikirim.
                                </td>
                            </tr>
                        ) : (
                            laporanList.map((item, index) => (
                                <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
                                    <td className="p-4 text-center text-gray-700">{index + 1}</td>
                                    <td className="p-4 text-gray-700">
                                        {item.jenis_laporan} - {item.periode}
                                    </td>
                                    <td className="p-4 text-center text-gray-700">
                                        {formatTanggal(item.created_at)}
                                    </td>
                                    <td className="p-4 text-center space-x-2">
                                        <button 
                                            onClick={() => handleDownload(item.id, item.jenis_laporan, item.periode)}
                                            className="border border-gray-400 bg-white hover:bg-gray-100 text-gray-800 px-3 py-1 rounded text-sm transition-colors"
                                        >
                                            Download
                                        </button>
                                        <button 
                                            onClick={() => setDeleteId(item.id)}
                                            className="border border-gray-400 bg-white hover:bg-red-50 text-red-600 px-3 py-1 rounded text-sm transition-colors"
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
                                    Hapus Data Laporan
                                </h2>

                                <p className="mt-1 text-sm text-gray-600">
                                    Apakah Anda yakin ingin menghapus data laporan ini?
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