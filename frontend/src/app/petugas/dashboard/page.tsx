"use client";

import Image from "next/image";
import { useEffect, useState, FormEvent } from "react";

interface DashboardResponse {
    total_destinasi: number;
    total_ulasan: number;
}

interface PetugasProfile {
    id: string;
    username: string;
    email: string;
    foto: string;
    created_at: string;
}

export default function DashboardPage() {

    const [dashboard, setDashboard] = useState<DashboardResponse>({
        total_destinasi: 0,
        total_ulasan: 0,
    });
    const [profile, setProfile] = useState<PetugasProfile | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [foto, setFoto] = useState<File | null>(null);
    const [errorMsg, setErrorMsg] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const getDashboard = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/dashboard`);

            const result = await response.json();

            setDashboard(result.data);

        } catch (error) {
            console.error("Gagal mengambil data dashboard:", error);
        }
    };

    const getProfile = async () => {
        try {
            const userData = JSON.parse(localStorage.getItem("user_data") || "{}");

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/petugas/${userData.id}`
            );

            const result = await response.json();

            setProfile(result.data);

            return result.data;
        } catch (error) {
            console.error("Gagal mengambil profile:", error);
            return null;
        }
    };

    const handleOpenEditModal = (petugas: PetugasProfile) => {
        setEditingId(petugas.id);
        setUsername(petugas.username);
        setEmail(petugas.email);
        setPassword("");
        setFoto(null);
        setErrorMsg("");
        setIsModalOpen(true);
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setErrorMsg("");
        setIsLoading(true);

        const formData = new FormData();
        formData.append("username", username);
        formData.append("email", email);

        if (password) formData.append("password", password);

        if (foto) formData.append("foto", foto);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/petugas/${editingId}`, {
                method: "PUT",
                body: formData,
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Gagal menyimpan petugas");

            setIsModalOpen(false);

            const updatedProfile = await getProfile();

            localStorage.setItem(
                "user_data",
                JSON.stringify(updatedProfile)
            );

            window.dispatchEvent(new Event("user-updated"));

            getDashboard();
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

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        getDashboard();
        getProfile();
    }, []);

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">
                Dashboard Petugas
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-gray-500 text-sm font-semibold mb-1">
                        Total Destinasi
                    </h3>
                    <p className="text-3xl font-bold text-blue-600">{dashboard.total_destinasi}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-gray-500 text-sm font-semibold mb-1">
                        Total Ulasan
                    </h3>
                    <p className="text-3xl font-bold text-orange-600">{dashboard.total_ulasan}</p>
                </div>
            </div>

            <div className="mt-10">
                <h2 className="text-3xl font-semibold text-gray-800 mb-6">
                    Profile
                </h2>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                    <div className="flex flex-col lg:flex-row gap-10">

                        <div className="flex justify-center">
                            <div className="w-64 h-64 rounded-xl border border-gray-200 flex items-center justify-center bg-gray-50">

                                {profile?.foto ? (
                                    <Image
                                        src={profile.foto}
                                        alt={profile.username}
                                        width={176}
                                        height={176}
                                        className="w-44 h-44 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-44 h-44 rounded-full bg-blue-600 text-white flex items-center justify-center text-6xl font-bold">
                                        {profile?.username?.charAt(0).toUpperCase()}
                                    </div>
                                )}

                            </div>
                        </div>

                        <div className="flex-1 grid grid-cols-[180px_1fr] gap-y-6 gap-x-8 items-center">

                            <span className="text-lg font-medium text-gray-700">
                                Username
                            </span>

                            <div className="bg-gray-100 text-slate-900 rounded-lg px-4 py-3">
                                {profile?.username ?? "-"}
                            </div>

                            <span className="text-lg font-medium text-gray-700">
                                Email
                            </span>

                            <div className="bg-gray-100 text-slate-900 rounded-lg px-4 py-3">
                                {profile?.email ?? "-"}
                            </div>

                            <span className="text-lg font-medium text-gray-700">
                                Peran
                            </span>

                            <div className="bg-gray-100 text-slate-900 rounded-lg px-4 py-3">
                                Petugas
                            </div>

                            <span className="text-lg font-medium text-gray-700">
                                Tanggal Bergabung
                            </span>

                            <div className="bg-gray-100 rounded-lg text-slate-900 px-4 py-3">
                                {profile?.created_at
                                    ? new Date(profile.created_at).toLocaleDateString(
                                        "id-ID",
                                        {
                                            day: "2-digit",
                                            month: "long",
                                            year: "numeric",
                                        }
                                    )
                                    : "-"}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex justify-end">
                    <button
                        className="bg-green-600 py-3 px-5 mt-5 rounded-xl hover:bg-green-900 transition-colors"
                        onClick={() => {
                            if (profile) {
                                handleOpenEditModal(profile);
                            }
                        }}>
                        Edit
                    </button>
                </div>
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
        </div>
    );
}