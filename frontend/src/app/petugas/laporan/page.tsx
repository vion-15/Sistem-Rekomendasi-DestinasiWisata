"use client";

import { useState, useEffect } from "react";

// Struktur data sesuai dengan model di Golang
interface Laporan {
    id: string;
    jenis_laporan: string;
    periode: string;
    created_at: string;
}

export default function LaporanPage() {
    const [laporanList, setLaporanList] = useState<Laporan[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fungsi untuk mengambil data dari backend
    const fetchLaporan = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("http://localhost:8080/api/petugas-laporan");
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

    // Fungsi untuk menghapus laporan
    const handleDelete = async (id: string) => {
        const confirmDelete = window.confirm("Apakah Anda yakin ingin menghapus laporan ini?");
        if (!confirmDelete) return;

        try {
            const res = await fetch(`http://localhost:8080/api/petugas-laporan/${id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                alert("Laporan berhasil dihapus");
                fetchLaporan(); // Refresh tabel setelah menghapus
            } else {
                alert("Gagal menghapus laporan");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Terjadi kesalahan pada server");
        }
    };

    const handleDownload = async (id: string, jenis: string, periode: string) => {
        try {
            const res = await fetch(`http://localhost:8080/api/petugas-laporan/${id}/download`, {
                method: 'GET',
            });

            if (res.ok) {
                // Konversi response menjadi Blob (objek file)
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
                alert("Gagal mengunduh: " + data.error);
            }
        } catch (error) {
            console.error("Error downloading file:", error);
            alert("Terjadi kesalahan koneksi saat mencoba mengunduh file.");
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
                                    {/* Menggabungkan Jenis Laporan dan Periode sesuai desain */}
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
                                            onClick={() => handleDelete(item.id)}
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
        </div>
    );
}