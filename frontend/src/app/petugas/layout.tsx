"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

type PetugasData = {
    username: string;
    email?: string;
    id?: string;
    foto?: string;
};

export default function PetugasLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const [petugasName, setPetugasName] = useState<string | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [petugasFoto, setPetugasFoto] = useState<string | null>(null);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    const executeLogout = () => {
        localStorage.removeItem("user_data");
        router.push("/login");
    };

    const menus = [
        { title: "Dashboard", href: "/petugas/dashboard" },
        { title: "Destinasi Wisata", href: "/petugas/destinasi" },
        { title: "Wisatawan", href: "/petugas/wisatawan" },
        { title: "Pencarian", href: "/petugas/pencarian" },
        { title: "Hasil Rekomendasi", href: "/petugas/hasil-rekomendasi" },
        { title: "Lokasi Destinasi", href: "/petugas/lokasi-destinasi" },
        { title: "Ulasan & Rating", href: "/petugas/ulasan" },
        { title: "Laporan", href: "/petugas/laporan" },
    ];

    const loadUserData = () => {
        const petugasData = localStorage.getItem("user_data");

        if (petugasData) {
            try {
                const parsed = JSON.parse(petugasData) as PetugasData;
                setPetugasName(parsed.username ?? null);
                setPetugasFoto(parsed.foto ?? null);
            } catch {
                console.error("Invalid petugas data");
                setPetugasName(null);
                setPetugasFoto(null);
            }
        }
    };

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            router.push("/login");
            return;
        }

        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadUserData();

        window.addEventListener("user-updated", loadUserData);

        setIsLoaded(true);

        return () => {
            window.removeEventListener("user-updated", loadUserData);
        };
    }, [router]);

    if (!isLoaded) return null;

    return (
        <div className="flex h-screen bg-gray-50">
            <aside className="w-64 bg-slate-800 text-white flex flex-col shadow-xl">
                <div className="p-5 text-xl font-bold border-b border-slate-700
                flex flex-row items-end gap-4">
                    <Image
                        src="/Logo.svg"
                        width={40}
                        height={40}
                        alt="gambar logo"
                    />
                    <h3>Disparekraf</h3>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {menus.map((menu) => (
                        <Link
                            key={menu.href}
                            href={menu.href}
                            className={`block rounded-lg px-4 py-3 transition-all duration-200 ${pathname === menu.href
                                ? "bg-sky-500 text-white font-semibold shadow-md"
                                : "text-slate-300 hover:bg-slate-700 hover:text-white"
                                }`}
                        >
                            {menu.title}
                        </Link>
                    ))}
                </nav>
            </aside>

            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white shadow-sm flex items-center justify-between p-5 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-700">
                        Sistem Rekomendasi Destinasi Wisata
                    </h2>

                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-gray-600">
                            {petugasName ?? "Petugas"}
                        </span>

                        {petugasFoto ? (
                            <Image
                                src={petugasFoto}
                                alt="Foto Petugas"
                                width={40}
                                height={40}
                                className="rounded-full object-cover w-10 h-10"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
                                {petugasName?.charAt(0).toUpperCase() ?? "A"}
                            </div>
                        )}

                        <button
                            onClick={() => setIsLogoutModalOpen(true)} //l
                            className="text-red-700 hover:text-red-600 font-medium flex items-center gap-2"
                        >
                            Logout
                        </button>
                    </div>
                </header>

                <main className="flex-1 p-8 overflow-y-auto">
                    {children}
                </main>
            </div>

            {/* MODAL KONFIRMASI LOGOUT */}
            {isLogoutModalOpen && (
                <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white p-6 rounded-2xl w-full max-w-sm shadow-2xl text-center relative">

                        {/* Ikon Peringatan (Opsional, agar lebih manis) */}
                        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                        </div>

                        <h2 className="text-xl font-bold text-gray-800 mb-10">Yakin ingin keluar?</h2>
                        <div className="flex justify-center gap-3">
                            <button
                                onClick={executeLogout}
                                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-colors"
                            >
                                Logout
                            </button>

                            <button
                                onClick={() => setIsLogoutModalOpen(false)}
                                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-colors"
                            >
                                Batal
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}