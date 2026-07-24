"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

export default function UniversalLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async (e: FormEvent) => {
        e.preventDefault();
        setErrorMsg("");
        setIsLoading(true);

        const formData = new FormData();
        formData.append("email", email);
        formData.append("password", password);

        try {
            const res = await fetch("http://localhost:8080/api/auth/login", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Gagal masuk");
            }

            localStorage.setItem("token", data.token);
            localStorage.setItem("user_role", data.role);
            localStorage.setItem("user_data", JSON.stringify(data.data));

            if (data.role === "admin") {
                router.push("/admin/dashboard");
            } else if (data.role === "petugas") {
                router.push("/petugas/dashboard");
            } else if (data.role === "wisatawan") {
                router.push("/wisatawan/dashboard");
            }

        } catch (err: unknown) {
            if (err instanceof Error) {
                setErrorMsg(err.message);
            } else {
                setErrorMsg("Gagal terhubung ke server");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div 
            className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat relative"
            style={{ backgroundImage: "url('/image/foto-bg-login-register.jpg')" }}
        >
            <div className="absolute inset-0 bg-slate-900/40 z-0"></div>

            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-100 relative z-10">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Login</h1>
                    <p className="text-slate-500 text-sm mt-2">Sistem Rekomendasi Destinasi Wisata</p>
                </div>

                {errorMsg && (
                    <div className="mb-6 p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100 font-medium">
                        {errorMsg}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 
                            rounded-xl text-slate-900 placeholder:text-slate-400 focus:ring-2 
                            focus:ring-blue-500 focus:bg-white outline-none transition-all"
                            placeholder="nama@email.com"
                            required
                        />
                    </div>

                    <div className="relative">
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
                        <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 
                            rounded-xl text-slate-900 placeholder:text-slate-400 focus:ring-2 
                            focus:ring-blue-500 focus:bg-white outline-none transition-all"
                            placeholder="••••••••"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-12 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                            {showPassword ? (
                                <EyeOff size={20} />
                            ) : (
                                <Eye size={20} />
                            )}
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full py-3 text-white rounded-xl font-bold tracking-wide transition-all 
                                    shadow-md ${isLoading ? "bg-blue-400 cursor-not-allowed" 
                                        : "bg-blue-600 hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5"
                                }`}
                    >
                        {isLoading ? "Mengautentikasi..." : "Masuk ke Sistem"}
                    </button>
                </form>

                <div 
                    className="mt-8 pt-6 border-t border-slate-100 text-center text-sm text-slate-600">
                        Wisatawan baru?{" "}
                        <Link 
                            href="/register" 
                            className="text-blue-600 hover:text-blue-700 hover:underline font-bold transition-colors">
                            Buat Akun Mandiri
                        </Link>
                </div>
            </div>
        </div>
    );
}