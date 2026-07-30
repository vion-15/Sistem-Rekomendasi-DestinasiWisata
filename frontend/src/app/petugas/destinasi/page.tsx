"use client";

import { MoveLeft, MoveRight, TriangleAlert } from "lucide-react";
import Image from "next/image";
import { useState, useEffect, FormEvent } from "react";

type Petugas = {
    id: string;
    username: string;
};

type Destinasi = {
    id: string;
    nama: string;
    nama_en: string;
    deskripsi: string;
    deskripsi_en: string;
    aktivitas: string;
    aktivitas_en: string
    alamat: string;
    kota: string;
    kota_en: string;
    kategori: string;
    kategori_en: string;
    latitude: number;
    longitude: number;
    gambar: string;
    petugas: Petugas;
};

interface UserData {
    id: string;
    username: string;
    email: string;
    foto: string;
}

export default function DestinasiPage() {
    const [destinasiList, setDestinasiList] = useState<Destinasi[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterKategori, setFilterKategori] = useState("");
    const [filterKota, setFilterKota] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [viewingDestinasi, setViewingDestinasi] = useState<Destinasi | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [nama, setNama] = useState("");
    const [deskripsi, setDeskripsi] = useState("");
    const [aktivitas, setAktivitas] = useState("");
    const [alamat, setAlamat] = useState("");
    const [kota, setKota] = useState("");
    const [kategori, setKategori] = useState("");
    const [latitude, setLatitude] = useState("");
    const [longitude, setLongitude] = useState("");
    const [gambar, setGambar] = useState<File | null>(null);
    const [csvFile, setCsvFile] = useState<File | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [userData, setUserData] = useState<UserData | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [namaEn, setNamaEn] = useState("");
    const [kategoriEn, setKategoriEn] = useState("");
    const [deskripsiEn, setDeskripsiEn] = useState("");
    const [aktivitasEn, setAktivitasEn] = useState("");
    const [kotaEn, setKotaEn] = useState("");

    useEffect(() => {
        const data = JSON.parse(
            localStorage.getItem("user_data") || "{}"
        ) as UserData;

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setUserData(data);
    }, []);

    const fetchDestinasi = async () => {
        try {
            const res = await fetch("http://localhost:8080/api/destinasi/");
            const data = await res.json();
            if (res.ok) setDestinasiList(data.data || []);
        } catch (error) {
            console.error("Gagal mengambil data destinasi:", error);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchDestinasi();
    }, []);

    const resetForm = () => {
        setEditingId(null);
        setNama("");
        setDeskripsi("");
        setAktivitas("");
        setAlamat("");
        setKota("");
        setKategori("");
        setLatitude("");
        setLongitude("");
        setGambar(null);
        setErrorMsg("");
        setNamaEn("");
        setKategoriEn("");
        setDeskripsiEn("");
        setAktivitasEn("");
        setKotaEn("");
    };

    const handleOpenAddModal = () => {
        resetForm();
        setIsModalOpen(true);
    };

    const handleOpenImportModal = () => {
        setCsvFile(null);
        setErrorMsg("");
        setIsImportModalOpen(true);
    };

    const handleOpenEditModal = (d: Destinasi) => {
        setEditingId(d.id);
        setNama(d.nama);
        setNamaEn(d.nama_en);
        setDeskripsi(d.deskripsi);
        setDeskripsiEn(d.deskripsi_en)
        setAktivitas(d.aktivitas);
        setAktivitasEn(d.aktivitas_en)
        setAlamat(d.alamat);
        setKota(d.kota);
        setKotaEn(d.kota_en)
        setKategori(d.kategori);
        setKategoriEn(d.kategori_en)
        setLatitude(d.latitude.toString());
        setLongitude(d.longitude.toString());
        setGambar(null);
        setErrorMsg("");
        setIsModalOpen(true);
    };

    const handleDelete = async () => {
        if (!deleteId) return;

        setIsDeleting(true);

        try {
            const res = await fetch(`http://localhost:8080/api/destinasi/${deleteId}`, { method: "DELETE" });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Gagal menghapus destinasi");
            setDeleteId(null);
            fetchDestinasi();
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

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setErrorMsg("");
        setIsLoading(true);

        const formData = new FormData();
        formData.append("nama", nama);
        formData.append("deskripsi", deskripsi);
        formData.append("aktivitas", aktivitas);
        formData.append("alamat", alamat);
        formData.append("kota", kota);
        formData.append("kategori", kategori);
        formData.append("latitude", latitude);
        formData.append("longitude", longitude);
        formData.append("nama_en", namaEn);
        formData.append("deskripsi_en", deskripsiEn);
        formData.append("aktivitas_en", aktivitasEn);
        formData.append("kota_en", kotaEn);
        formData.append("kategori_en", kategoriEn);
        if (userData) {
            formData.append("id_petugas", userData.id);
        }
        if (gambar) formData.append("gambar", gambar);

        const url = editingId
            ? `http://localhost:8080/api/destinasi/${editingId}`
            : "http://localhost:8080/api/destinasi/";
        const method = editingId ? "PUT" : "POST";

        try {
            const res = await fetch(url, { method, body: formData });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Gagal menyimpan destinasi");

            setIsModalOpen(false);
            fetchDestinasi();
        } catch (err: unknown) {
            if (err instanceof Error) {
                setErrorMsg(err.message);
            } else {
                setErrorMsg("Terjadi kesalahan tidak diketahui");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleImportSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!csvFile) {
            setErrorMsg("Silakan pilih file CSV terlebih dahulu.");
            return;
        }

        setErrorMsg("");
        setIsImporting(true);

        const formData = new FormData();
        formData.append("file", csvFile);

        try {
            const res = await fetch("http://localhost:8080/api/destinasi/import", {
                method: "POST",
                body: formData,
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Gagal mengimport data destinasi");

            alert(`Berhasil mengimport data destinasi!`);
            setIsImportModalOpen(false);
            setCsvFile(null);
            fetchDestinasi();
        } catch (err: unknown) {
            if (err instanceof Error) {
                setErrorMsg(err.message);
            } else {
                setErrorMsg("Terjadi kesalahan saat proses import.");
            }
        } finally {
            setIsImporting(false);
        }
    };

    const handleOpenViewModal = (d: Destinasi) => {
        setViewingDestinasi(d);
        setIsViewModalOpen(true);
    };

    // --- LOGIKA FILTER & PENCARIAN ---

    // Ekstrak opsi unik untuk dropdown filter
    const uniqueKategori = Array.from(new Set(destinasiList.map(d => d.kategori))).sort();
    const uniqueKota = Array.from(new Set(destinasiList.map(d => d.kota))).sort();

    // Terapkan filter ke data
    const filteredDestinasiList = destinasiList.filter((d) => {
        const matchSearch = d.nama.toLowerCase().includes(searchQuery.toLowerCase());
        const matchKategori = filterKategori === "" || d.kategori === filterKategori;
        const matchKota = filterKota === "" || d.kota === filterKota;
        return matchSearch && matchKategori && matchKota;
    });

    const totalPages = Math.ceil(filteredDestinasiList.length / itemsPerPage);

    const startIndex = (currentPage - 1) * itemsPerPage;

    const currentData = filteredDestinasiList.slice(
        startIndex,
        startIndex + itemsPerPage
    );

    const getPageNumbers = () => {
        const delta = 2;
        const pages: (number | string)[] = [];

        for (let i = 1; i <= totalPages; i++) {
            if (
                i === 1 ||
                i === totalPages ||
                (i >= currentPage - delta && i <= currentPage + delta)
            ) {
                pages.push(i);
            } else if (pages[pages.length - 1] !== "...") {
                pages.push("...");
            }
        }

        return pages;
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Destinasi Wisata</h1>
                <div className="flex gap-3">
                    <button
                        onClick={handleOpenImportModal}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 
                        rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                        📄 Import CSV
                    </button>
                    <button
                        onClick={handleOpenAddModal}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                        + Tambah Destinasi
                    </button>
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                    <input
                        type="text"
                        placeholder="Cari nama destinasi..."
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                        className="w-full pl-10 pr-4 text-slate-900 placeholder:text-slate-400 py-2 border border-gray-200 
                        rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
                    />
                </div>

                <select
                    value={filterKota}
                    onChange={(e) => { setFilterKota(e.target.value); setCurrentPage(1); }}
                    className="w-full md:w-48 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 
                    outline-none bg-white text-gray-700"
                >
                    <option value="">Semua Kota</option>
                    {uniqueKota.map(kota => (
                        <option key={kota} value={kota}>{kota}</option>
                    ))}
                </select>

                <select
                    value={filterKategori}
                    onChange={(e) => { setFilterKategori(e.target.value); setCurrentPage(1); }}
                    className="w-full md:w-48 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 
                    outline-none bg-white text-gray-700"
                >
                    <option value="">Semua Kategori</option>
                    {uniqueKategori.map(kat => (
                        <option key={kat} value={kat}>{kat}</option>
                    ))}
                </select>

                {(searchQuery || filterKategori || filterKota) && (
                    <button
                        onClick={() => {
                            setSearchQuery("");
                            setFilterKategori("");
                            setFilterKota("");
                            setCurrentPage(1);
                        }}
                        className="px-4 py-2 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-lg 
                        font-medium transition-colors whitespace-nowrap"
                    >
                        Reset
                    </button>
                )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="p-4 font-semibold text-gray-600">No</th>
                            <th className="p-4 font-semibold text-gray-600">Foto</th>
                            <th className="p-4 font-semibold text-gray-600">Nama Destinasi</th>
                            <th className="p-4 font-semibold text-gray-600">Kota</th>
                            <th className="p-4 font-semibold text-gray-600">Kategori</th>
                            <th className="p-4 font-semibold text-gray-600 text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentData.map((d, index) => (
                            <tr key={d.id} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="p-4 text-center text-gray-700">
                                    {startIndex + index + 1}
                                </td>
                                <td className="p-4 text-gray-800 flex items-center gap-3">
                                    <Image
                                        src={d.gambar || "https://placehold.co/100x100/png?text=No+Image"}
                                        alt={d.nama}
                                        width={48}
                                        height={48}
                                        className="w-12 h-12 rounded object-cover border border-gray-200"
                                    />
                                </td>
                                <td className="p-4 text-gray-600">
                                    {d.nama}
                                </td>
                                <td className="p-4 text-gray-600">{d.kota}</td>
                                <td className="p-4 text-gray-600">
                                    <span className="bg-indigo-50 text-indigo-600 px-2 py-1 rounded text-sm">{d.kategori}</span>
                                </td>
                                <td className="p-4 text-center">
                                    <button onClick={() => handleOpenViewModal(d)} className="text-emerald-600 
                                    hover:text-emerald-800 mx-2 font-bold transition-colors">
                                        Lihat
                                    </button>
                                    <button onClick={() => handleOpenEditModal(d)} className="text-blue-500 
                                    hover:text-blue-700 mx-2 font-medium">Edit</button>
                                    <button onClick={() => setDeleteId(d.id)} className="text-red-500 
                                    hover:text-red-700 mx-2 font-medium">Hapus</button>
                                </td>
                            </tr>
                        ))}
                        {currentData.length === 0 && (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-gray-500">
                                    {destinasiList.length === 0
                                        ? "Belum ada data destinasi."
                                        : "Tidak ada destinasi yang cocok dengan pencarian/filter."}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-5 py-4 border-t border-gray-200">

                    <p className="text-sm text-gray-500">
                        Menampilkan{" "}
                        <span className="font-semibold text-gray-700">
                            {filteredDestinasiList.length === 0 ? 0 : startIndex + 1}
                        </span>
                        {" - "}
                        <span className="font-semibold text-gray-700">
                            {Math.min(startIndex + itemsPerPage, filteredDestinasiList.length)}
                        </span>
                        {" dari "}
                        <span className="font-semibold text-gray-700">
                            {filteredDestinasiList.length}
                        </span>{" "}
                        data
                    </p>

                    <div className="flex items-center gap-1">

                        <button
                            onClick={() =>
                                setCurrentPage((p) => Math.max(p - 1, 1))
                            }
                            disabled={currentPage === 1}
                            className="h-10 px-4 border rounded-lg bg-white hover:bg-gray-100 disabled:opacity-40 
                            disabled:cursor-not-allowed transition"
                        >
                            <MoveLeft className="text-slate-800" />
                        </button>

                        {getPageNumbers().map((page, index) =>
                            page === "..." ? (
                                <span
                                    key={index}
                                    className="w-10 text-center text-gray-400"
                                >
                                    ...
                                </span>
                            ) : (
                                <button
                                    key={`page-${page}`}
                                    onClick={() => setCurrentPage(Number(page))}
                                    className={`h-10 w-10 rounded-lg font-medium transition
                                        ${currentPage === page
                                            ? "bg-sky-500 text-white shadow-md"
                                            : "border bg-white hover:bg-gray-100 text-gray-700"
                                        }`}
                                >
                                    {page}
                                </button>
                            )
                        )}

                        {/* Next */}
                        <button
                            onClick={() =>
                                setCurrentPage((p) =>
                                    Math.min(p + 1, totalPages)
                                )
                            }
                            disabled={currentPage === totalPages}
                            className="h-10 px-4 border rounded-lg bg-white hover:bg-gray-100 disabled:opacity-40 
                            disabled:cursor-not-allowed transition"
                        >
                            <MoveRight className="text-slate-800" />
                        </button>

                    </div>
                </div>
            </div>

            {isImportModalOpen && (
                <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-2xl">
                        <h2 className="text-xl font-bold text-gray-800 mb-2">Import Destinasi via CSV</h2>
                        <p className="text-sm text-gray-500 mb-4">
                            Unggah file CSV dengan format kolom: <br />
                            <code className="text-xs bg-slate-100 px-1 py-0.5 rounded text-blue-600">
                                nama, deskripsi, aktivitas, alamat, kota, kategori, latitude, longitude, nama-english, deskripsi-english,
                                aktivitas-english, kota-english, kategori-english
                            </code>
                        </p>

                        {errorMsg && (
                            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm border border-red-200">
                                {errorMsg}
                            </div>
                        )}

                        <form onSubmit={handleImportSubmit} className="space-y-4">
                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 
                            transition-colors">
                                <input
                                    type="file"
                                    accept=".csv"
                                    onChange={(e) => setCsvFile(e.target.files ? e.target.files[0] : null)}
                                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full 
                                    file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 
                                    hover:file:bg-blue-100 cursor-pointer"
                                    required
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setIsImportModalOpen(false)} className="px-4 py-2 
                                text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium">Batal</button>
                                <button type="submit" disabled={isImporting} className={`px-4 py-2 text-white rounded-lg 
                                    font-medium ${isImporting ? "bg-emerald-400" : "bg-emerald-600 hover:bg-emerald-700"}`}>
                                    {isImporting ? "Memproses..." : "Upload & Import"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-8 rounded-2xl w-full max-w-6xl shadow-2xl max-h-[92vh] overflow-y-auto">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">
                            {editingId ? "Edit Destinasi Wisata" : "Tambah Destinasi Baru"}
                        </h2>

                        {errorMsg && (
                            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm border border-red-200">
                                {errorMsg}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">

                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nama Destinasi
                                    </label>

                                    <input
                                        type="text"
                                        value={nama}
                                        onChange={(e) => setNama(e.target.value)}
                                        placeholder="Nama Destinasi"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg
                                        focus:ring-2 focus:ring-blue-500 outline-none text-slate-800"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Destination Name (English)
                                    </label>

                                    <input
                                        type="text"
                                        value={namaEn}
                                        onChange={(e) => setNamaEn(e.target.value)}
                                        placeholder="Destination Name"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg
                                        focus:ring-2 focus:ring-blue-500 outline-none text-slate-800"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Kategori
                                    </label>

                                    <input
                                        type="text"
                                        value={kategori}
                                        onChange={(e) => setKategori(e.target.value)}
                                        placeholder="Misal: Taman Wisata"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg
                                        focus:ring-2 focus:ring-blue-500 outline-none text-slate-800"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Category (English)
                                    </label>

                                    <input
                                        type="text"
                                        value={kategoriEn}
                                        onChange={(e) => setKategoriEn(e.target.value)}
                                        placeholder="Example: Tourism Park"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg
                                        focus:ring-2 focus:ring-blue-500 outline-none text-slate-800"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Deskripsi Wisata
                                    </label>

                                    <textarea
                                        value={deskripsi}
                                        onChange={(e) => setDeskripsi(e.target.value)}
                                        rows={6}
                                        required
                                        placeholder="Deskripsi wisata..."
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg
                                        resize-none focus:ring-2 focus:ring-blue-500 outline-none
                                        text-slate-800"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Description (English)
                                    </label>

                                    <textarea
                                        value={deskripsiEn}
                                        onChange={(e) => setDeskripsiEn(e.target.value)}
                                        rows={6}
                                        required
                                        placeholder="Destination description..."
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg
                                        resize-none focus:ring-2 focus:ring-blue-500 outline-none
                                        text-slate-800"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Aktivitas
                                    </label>

                                    <textarea
                                        value={aktivitas}
                                        onChange={(e) => setAktivitas(e.target.value)}
                                        rows={4}
                                        required
                                        placeholder="Contoh: jogging, piknik, fotografi"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg
                                        resize-none focus:ring-2 focus:ring-blue-500 outline-none
                                        text-slate-800"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Activities (English)
                                    </label>

                                    <textarea
                                        value={aktivitasEn}
                                        onChange={(e) => setAktivitasEn(e.target.value)}
                                        rows={4}
                                        required
                                        placeholder="Example: jogging, picnic, photography"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg
                                        resize-none focus:ring-2 focus:ring-blue-500 outline-none
                                        text-slate-800"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Alamat Lengkap
                                </label>

                                <textarea
                                    value={alamat}
                                    onChange={(e) => setAlamat(e.target.value)}
                                    rows={3}
                                    placeholder="Alamat lengkap"
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg
                                    resize-none focus:ring-2 focus:ring-blue-500 outline-none
                                    text-slate-800"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Kota
                                    </label>

                                    <input
                                        type="text"
                                        value={kota}
                                        onChange={(e) => setKota(e.target.value)}
                                        placeholder="Jakarta Selatan"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg
                                        focus:ring-2 focus:ring-blue-500 outline-none text-slate-800"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        City (English)
                                    </label>

                                    <input
                                        type="text"
                                        value={kotaEn}
                                        onChange={(e) => setKotaEn(e.target.value)}
                                        placeholder="South Jakarta"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg
                                        focus:ring-2 focus:ring-blue-500 outline-none text-slate-800"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Latitude
                                    </label>

                                    <input
                                        type="number"
                                        step="any"
                                        value={latitude}
                                        onChange={(e) => setLatitude(e.target.value)}
                                        placeholder="-6.200000"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg
                                        focus:ring-2 focus:ring-blue-500 outline-none text-slate-800"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Longitude
                                    </label>

                                    <input
                                        type="number"
                                        step="any"
                                        value={longitude}
                                        onChange={(e) => setLongitude(e.target.value)}
                                        placeholder="106.816666"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg
                                        focus:ring-2 focus:ring-blue-500 outline-none text-slate-800"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Gambar{" "}
                                    {editingId && (
                                        <span className="text-gray-400 font-normal">
                                            (Opsional)
                                        </span>
                                    )}
                                </label>

                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) =>
                                        setGambar(e.target.files ? e.target.files[0] : null)
                                    }
                                    required={!editingId}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg
                                    focus:ring-2 focus:ring-blue-500 outline-none
                                    text-slate-800
                                    file:mr-4
                                    file:py-2
                                    file:px-4
                                    file:rounded-lg
                                    file:border-0
                                    file:bg-blue-50
                                    file:text-blue-700"
                                />
                            </div>

                            <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium">Batal</button>
                                <button type="submit" disabled={isLoading}
                                    className={`px-4 py-2 text-white rounded-lg font-medium ${isLoading ? "bg-blue-400"
                                        : "bg-blue-600 hover:bg-blue-700"}`}>
                                    {isLoading ? "Menyimpan..." : "Simpan"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isViewModalOpen && viewingDestinasi && (
                <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-60 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        {/* Header */}
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h2 className="text-xl font-bold text-slate-800">Detail Informasi Destinasi</h2>
                            <button onClick={() => setIsViewModalOpen(false)}
                                className="text-slate-400 hover:text-red-500 text-2xl font-bold leading-none 
                                transition-colors">&times;</button>
                        </div>

                        <div className="p-6 overflow-y-auto flex flex-col md:flex-row gap-8">
                            <div className="w-full md:w-1/3 flex flex-col gap-4">
                                <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-100 
                                relative aspect-square">
                                    <Image
                                        src={viewingDestinasi.gambar || "https://placehold.co/100x100/png?text=No+Image"}
                                        alt={viewingDestinasi.nama}
                                        fill
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1.5 
                                    rounded-full uppercase tracking-wider">
                                        {viewingDestinasi.kategori}
                                    </span>
                                    <span className="bg-slate-100 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-full">
                                        📍 {viewingDestinasi.kota}
                                    </span>
                                </div>
                            </div>

                            {/* Panel Kanan: Teks & Informasi */}
                            <div className="w-full md:w-2/3 space-y-5">
                                <div>
                                    <h3 className="text-3xl font-bold text-slate-800 mb-1">{viewingDestinasi.nama}</h3>
                                    <p className="text-sm text-slate-500 font-medium">
                                        Dikelola oleh: <span className="text-slate-700">
                                            {viewingDestinasi.petugas?.username || "Admin (Pusat)"}
                                        </span>
                                    </p>
                                </div>

                                <div>
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Deskripsi</h4>
                                    <p className="text-slate-700 text-sm leading-relaxed bg-slate-50 p-4 rounded-xl border 
                                    border-slate-100">
                                        {viewingDestinasi.deskripsi}
                                    </p>
                                </div>

                                <div>
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Alamat Lengkap</h4>
                                    <p className="text-slate-700 text-sm">
                                        {viewingDestinasi.alamat}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-2">
                                    <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                                        <span className="block text-xs font-bold text-blue-600 mb-1 uppercase tracking-wider">
                                            Latitude</span>
                                        <span className="font-mono text-sm text-slate-800 font-medium">
                                            {viewingDestinasi.latitude}</span>
                                    </div>
                                    <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                                        <span className="block text-xs font-bold text-blue-600 mb-1 uppercase tracking-wider">
                                            Longitude</span>
                                        <span className="font-mono text-sm text-slate-800 font-medium">
                                            {viewingDestinasi.longitude}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
                            <button onClick={() => setIsViewModalOpen(false)} className="px-6 py-2.5 bg-slate-800 
                            hover:bg-slate-900 text-white rounded-xl font-bold transition-colors shadow-sm">
                                Tutup Panel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {deleteId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">

                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                                <TriangleAlert className="text-red-600" />
                            </div>

                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">
                                    Hapus Data Destinasi
                                </h2>

                                <p className="mt-1 text-sm text-gray-600">
                                    Apakah Anda yakin ingin menghapus data destinasi ini?
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