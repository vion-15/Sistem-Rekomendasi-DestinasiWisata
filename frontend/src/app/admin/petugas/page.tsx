"use client";

import { TriangleAlert } from "lucide-react";
import Image from "next/image";
import { useState, useEffect, FormEvent } from "react";

type Petugas = {
    id: string;
    username: string;
    email: string;
    foto: string;
    created_at: string;
};

export default function PetugasPage() {
    const [petugasList, setPetugasList] = useState<Petugas[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const [editingId, setEditingId] = useState<string | null>(null);
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [foto, setFoto] = useState<File | null>(null);

    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchPetugas = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/petugas/`);
            const data = await res.json();
            if (res.ok) {
                setPetugasList(data.data || []);
            }
        } catch (error) {
            console.error("Network error:", error);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchPetugas();
    }, []);

    const handleOpenAddModal = () => {
        setEditingId(null);
        setUsername("");
        setEmail("");
        setPassword("");
        setFoto(null);
        setErrorMsg("");
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (petugas: Petugas) => {
        setEditingId(petugas.id);
        setUsername(petugas.username);
        setEmail(petugas.email);
        setPassword("");
        setFoto(null);
        setErrorMsg("");
        setIsModalOpen(true);
    };

    const handleDelete = async () => {
        if (!deleteId) return;

        setIsDeleting(true);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/petugas/${deleteId}`, {
                method: "DELETE",
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Gagal menghapus petugas");

            setDeleteId(null);
            fetchPetugas();
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
        formData.append("username", username);
        formData.append("email", email);

        if (password) formData.append("password", password);

        if (foto) formData.append("foto", foto);

        const url = editingId
            ? `${process.env.NEXT_PUBLIC_API_URL}/api/petugas/${editingId}`
            : `${process.env.NEXT_PUBLIC_API_URL}/api/petugas/`;
        const method = editingId ? "PUT" : "POST";

        try {
            const res = await fetch(url, {
                method,
                body: formData,
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Gagal menyimpan petugas");

            setIsModalOpen(false);
            fetchPetugas();
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
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Petugas</h1>
                <button
                    onClick={handleOpenAddModal}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                    + Tambah Petugas
                </button>
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
                            <th className="p-4 font-semibold text-gray-600 text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {petugasList.map((p, index) => (
                            <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                <td className="p-4 text-center text-gray-700">
                                    {index + 1}
                                </td>
                                <td className="p-4 text-gray-800 flex items-center gap-3">
                                    <Image
                                        src={p.foto || "/image/default-avatar.png"}
                                        alt={`Foto ${p.username}`}
                                        height={40}
                                        width={40}
                                        className="h-10 w-10 rounded-full object-cover border border-gray-200"
                                    />
                                </td>
                                <td className="p-4 text-gray-600">{p.username}</td>
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
                                        onClick={() => setDeleteId(p.id)}
                                        className="text-red-500 hover:text-red-700 mx-2 font-medium transition-colors"
                                    >
                                        Hapus
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {petugasList.length === 0 && (
                            <tr>
                                <td colSpan={6} className="p-4 text-center text-gray-500">
                                    Belum ada data petugas.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-2xl">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">
                            {editingId ? "Edit Data Petugas" : "Tambah Petugas Baru"}
                        </h2>

                        {errorMsg && (
                            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm border border-red-200">
                                {errorMsg}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Username
                                </label>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 
                                    focus:ring-blue-500 outline-none text-slate-800 placeholder:text-slate-400"
                                    placeholder="Masukkan username petugas"
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
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 
                                    focus:ring-blue-500 outline-none text-slate-800 placeholder:text-slate-400"
                                    placeholder="petugas@wisata.com"
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
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 
                                    focus:ring-blue-500 outline-none text-slate-800 placeholder:text-slate-400"
                                    placeholder="••••••••"
                                    required={!editingId}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Foto Profile {editingId && <span className="text-gray-400 font-normal">(Opsional)</span>}
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setFoto(e.target.files ? e.target.files[0] : null)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 
                                    focus:ring-blue-500 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full 
                                    file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 
                                    hover:file:bg-blue-100 transition-all text-slate-800 placeholder:text-slate-400"
                                    required={!editingId}
                                />
                            </div>

                            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg 
                                    font-medium transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className={`px-4 py-2 text-white rounded-lg font-medium transition-colors 
                                        ${isLoading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                                        }`}
                                >
                                    {isLoading ? "Menyimpan..." : "Simpan"}
                                </button>
                            </div>
                        </form>
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
                                    Hapus Data Petugas
                                </h2>

                                <p className="mt-1 text-sm text-gray-600">
                                    Apakah Anda yakin ingin menghapus data petugas ini?
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