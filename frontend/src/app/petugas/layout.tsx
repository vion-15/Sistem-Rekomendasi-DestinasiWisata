"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

type AdminData = {
    username: string;
    email?: string;
    id?: string;
    foto?: string;
};

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();

    const [adminName, setAdminName] = useState<string | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [adminFoto, setAdminFoto] = useState<string | null>(null);

    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    const executeLogout = () => {
        // 1. Hapus sesi atau data login (sesuaikan dengan cara Anda menyimpan sesi)
        localStorage.removeItem("user_data");

        // 2. Arahkan kembali ke halaman login
        router.push("/login"); // Ubah rute ini sesuai dengan rute login Anda
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

    useEffect(() => {
        const token = localStorage.getItem("token");
        const adminData = localStorage.getItem("user_data");

        if (!token) {
            router.push("/login");
            return;
        }

        if (adminData) {
            try {
                const parsed = JSON.parse(adminData) as AdminData;
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setAdminName(parsed.username ?? null);
                setAdminFoto(parsed.foto ?? null);
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (e) {
                console.error("Invalid admin data");
                setAdminName(null);
            }
        }

        setIsLoaded(true);
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("admin_data");
        router.push("/login");
    };

    // guard render sampai data siap
    if (!isLoaded) return null;

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-800 text-white flex flex-col shadow-xl">
                <div className="p-5 text-xl font-bold border-b border-slate-700
                flex flex-row items-end gap-4">
                    <Image
                        src="/logo.svg"
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

            {/* Main */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white shadow-sm flex items-center justify-between p-5 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-700">
                        Sistem Rekomendasi Destinasi Wisata
                    </h2>

                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-gray-600">
                            {adminName ?? "Admin"}
                        </span>

                        {adminFoto ? (
                            <Image
                                src={adminFoto}
                                alt="Foto Admin"
                                width={40}
                                height={40}
                                className="rounded-full object-cover w-10 h-10"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
                                {adminName?.charAt(0).toUpperCase() ?? "A"}
                            </div>
                        )}

                        <button
                            onClick={() => setIsLogoutModalOpen(true)} // <-- Hanya membuka modal
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
                            {/* Tombol Logout (KIRI) */}
                            <button
                                onClick={executeLogout}
                                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-colors"
                            >
                                Logout
                            </button>

                            {/* Tombol Batal (KANAN) */}
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