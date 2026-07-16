"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

export default function RegisterWisatawanPage() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [alamat, setAlamat] = useState("");
    
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setErrorMsg("");
        setSuccessMsg("");
        setIsLoading(true);

        const formData = new FormData();
        formData.append("username", username);
        formData.append("email", email);
        formData.append("password", password);
        formData.append("alamat", alamat);

        try {
            const res = await fetch("http://localhost:8080/api/wisatawan/register", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Gagal melakukan registrasi");
            }

            setSuccessMsg(data.message || "Registrasi berhasil!");
            
            // Redirect ke halaman login setelah 2 detik sukses
            setTimeout(() => {
                router.push("/wisatawan/login");
            }, 2000);

        } catch (err: unknown) {
            if (err instanceof Error) {
                setErrorMsg(err.message);
            } else {
                setErrorMsg("Terjadi kesalahan sistem");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
                <h1 className="text-2xl font-bold text-gray-800 text-center mb-2">Daftar Akun</h1>
                <p className="text-gray-500 text-sm text-center mb-6">Mulai jelajahi destinasi terbaik pilihan Anda</p>

                {errorMsg && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm border border-red-200">
                        {errorMsg}
                    </div>
                )}

                {successMsg && (
                    <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg text-sm border border-green-200">
                        {successMsg}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                            text-slate-900 placeholder:text-slate-400 focus:ring-2 
                            focus:ring-blue-500 outline-none transition-all"
                            placeholder="Masukkan nama lengkap"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                            text-slate-900 placeholder:text-slate-400 focus:ring-2 
                            focus:ring-blue-500 outline-none transition-all"
                            placeholder="nama@email.com"
                            required
                        />
                    </div>

                    <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                            text-slate-900 placeholder:text-slate-400 focus:ring-2 
                            focus:ring-blue-500 outline-none transition-all"
                            placeholder="Minimal 8 karakter"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-11 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                            {showPassword ? (
                                <EyeOff size={20} />
                            ) : (
                                <Eye size={20} />
                            )}
                        </button>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Sekarang</label>
                        <textarea
                            value={alamat}
                            onChange={(e) => setAlamat(e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                            text-slate-900 placeholder:text-slate-400 focus:ring-2 
                            focus:ring-blue-500 outline-none transition-all resize-none"
                            placeholder="Masukkan alamat lengkap"
                            required
                        ></textarea>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full py-2.5 text-white rounded-lg font-medium transition-colors ${
                            isLoading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                        }`}
                    >
                        {isLoading ? "Memproses..." : "Daftar Sekarang"}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-600">
                    Sudah punya akun?{" "}
                    <Link href="/login" className="text-blue-600 hover:underline font-medium">
                        Login di sini
                    </Link>
                </div>
            </div>
        </div>
    );
}