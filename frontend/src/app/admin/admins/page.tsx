"use client";

import Image from "next/image";
import { useState, useEffect, FormEvent } from "react";

type Admin = {
    id: string;
    username: string;
    email: string;
    foto?: string;
    created_at: string;
};

export default function PetugasPage() {
    const [adminList, setAdminList] = useState<Admin[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    // State untuk form input
    const [editingId, setEditingId] = useState<string | null>(null);
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [foto, setFoto] = useState<File | null>(null);

    const fetchAdmin = async () => {
        try {
            const res = await fetch("http://localhost:8080/api/admin/");
            const data = await res.json();
            if (res.ok) {
                setAdminList(data.data || []);
            }
        } catch (error) {
            console.error("Network error:", error);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchAdmin();
    }, []);

    // Fungsi untuk membuka modal Tambah
    const handleOpenAddModal = () => {
        setEditingId(null);
        setUsername("");
        setEmail("");
        setPassword("");
        setFoto(null);
        setErrorMsg("");
        setIsModalOpen(true);
    };

    // Fungsi untuk membuka modal Edit dan mengisi data awal
    const handleOpenEditModal = (admin: Admin) => {
        setEditingId(admin.id);
        setUsername(admin.username);
        setEmail(admin.email);
        setPassword(""); // Password dikosongkan, diisi kalau mau diganti saja
        setFoto(null);
        setErrorMsg("");
        setIsModalOpen(true);
    };

    // Fungsi Hapus (Delete)
    const handleDelete = async (id: string) => {
        if (!window.confirm("Apakah Anda yakin ingin menghapus data admin ini?")) return;

        try {
            const res = await fetch(`http://localhost:8080/api/admin/${id}`, {
                method: "DELETE",
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Gagal menghapus petugas");

            fetchAdmin(); // Refresh data setelah berhasil dihapus
        } catch (err: unknown) {
            if (err instanceof Error) {
                alert(err.message);
            } else {
                alert("Terjadi kesalahan");
            }
        }
    };

    // Fungsi Submit (Create & Update)
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setErrorMsg("");
        setIsLoading(true);

        const formData = new FormData();
        formData.append("username", username);
        formData.append("email", email);

        // Hanya kirim password jika diisi (penting untuk mode Edit)
        if (password) formData.append("password", password);

        if (foto) {
            formData.append("foto", foto);
        }

        // Tentukan URL dan Method berdasarkan mode (Edit atau Create)
        const url = editingId
            ? `http://localhost:8080/api/admin/${editingId}`
            : "http://localhost:8080/api/admin/";
        const method = editingId ? "PUT" : "POST";

        try {
            const res = await fetch(url, {
                method,
                body: formData,
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Gagal menyimpan admin");

            setIsModalOpen(false);
            fetchAdmin();
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

    return (
        <div>
            {/* Header Area */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Admin</h1>
                <button
                    onClick={handleOpenAddModal}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                    + Tambah Admin
                </button>
            </div>

            {/* Tabel Data Admin */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="p-4 font-semibold text-gray-600 text-center">No</th>
                            <th className="p-4 font-semibold text-gray-600">Foto</th>
                            <th className="p-4 font-semibold text-gray-600">Username</th>
                            <th className="p-4 font-semibold text-gray-600">Email</th>
                            <th className="p-4 font-semibold text-gray-600">Tanggal</th>
                            <th className="p-4 font-semibold text-gray-600 text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {adminList.map((p, index) => (
                            <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                <td className="p-4 text-center text-gray-700">
                                    {index + 1}
                                </td>
                                <td className="p-4">
                                    {p.foto ? (
                                        <Image
                                            src={p.foto}
                                            alt={p.username}
                                            width={40}
                                            height={40}
                                            className="w-12 h-12 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
                                            {p.username.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </td>
                                <td className="p-4 text-gray-800 flex items-center gap-3">
                                    <span className="font-medium">{p.username}</span>
                                </td>
                                <td className="p-4 text-gray-600">{p.email}</td>
                                <td className="p-4 text-gray-600">
                                    {new Date(p.created_at).toLocaleDateString("id-ID", {
                                        day: "2-digit",
                                        month: "long",
                                        year: "numeric",
                                    })}
                                </td>
                                <td className="p-4 text-center">
                                    <button
                                        onClick={() => handleOpenEditModal(p)}
                                        className="text-blue-500 hover:text-blue-700 mx-2 font-medium transition-colors"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(p.id)}
                                        className="text-red-500 hover:text-red-700 mx-2 font-medium transition-colors"
                                    >
                                        Hapus
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {adminList.length === 0 && (
                            <tr>
                                <td colSpan={3} className="p-4 text-center text-gray-500">
                                    Belum ada data Admin.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal Form Tambah/Edit Petugas */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-2xl">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">
                            {editingId ? "Edit Data Admin" : "Tambah Admin Baru"}
                        </h2>

                        {errorMsg && (
                            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm border border-red-200">
                                {errorMsg}
                            </div>
                        )}

                        <form
                            onSubmit={handleSubmit}
                            className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Username
                                </label>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 placeholder:text-slate-400"
                                    placeholder="Masukkan username admin"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-3 py-2 border 
                                    border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 
                                    outline-none text-slate-800 placeholder:text-slate-400"
                                    placeholder="admin@wisata.com"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Password {editingId && <span className="text-gray-400 font-normal">(Isi jika ingin diganti)</span>}
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 
                                    outline-none text-slate-800 placeholder:text-slate-400"
                                    placeholder="••••••••"
                                    required={!editingId}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Foto Profil
                                </label>

                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        if (e.target.files?.[0]) {
                                            setFoto(e.target.files[0]);
                                        }
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg
                                    text-slate-800 file:mr-3 file:px-3 file:py-2
                                    file:border-0 file:bg-blue-600 file:text-white
                                    file:rounded-lg"
                                />
                            </div>

                            {/* Tombol Modal */}
                            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className={`px-4 py-2 text-white rounded-lg font-medium transition-colors ${isLoading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                                        }`}
                                >
                                    {isLoading ? "Menyimpan..." : "Simpan"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}