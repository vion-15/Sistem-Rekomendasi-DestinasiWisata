"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation"; // 1. Tambahkan usePathname
import Link from "next/link";
import Image from "next/image";

type UserData = {
    username: string;
    foto?: string;
};

export default function WisatawanLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname(); // 2. Inisialisasi pathname

    const [userData, setUserData] = useState<UserData | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("user_role");
        const rawData = localStorage.getItem("user_data");

        // Pastikan hanya wisatawan yang bisa mengakses
        // if (!token || role !== "wisatawan") {
        //     router.replace("/login");
        //     return;
        // }

        let parsedData: UserData | null = null;

        if (rawData) {
            try {
                parsedData = JSON.parse(rawData);
            } catch {
                console.error("Invalid user data");
            }
        }

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setUserData(parsedData);
        setIsLoaded(true);
    }, []);

    const executeLogout = () => {
        // 1. Hapus sesi atau data login (sesuaikan dengan cara Anda menyimpan sesi)
        localStorage.removeItem("user_data");

        // 2. Arahkan kembali ke halaman login
        router.push("/login"); // Ubah rute ini sesuai dengan rute login Anda
    };

    const handleLogout = () => {
        localStorage.clear();
        router.replace("/login");
    };

    if (!isLoaded) return null;

    // 3. Kelas CSS untuk menu Aktif dan Tidak Aktif
    const activeClass = "text-slate-800 bg-slate-300/50 border border-slate-400/30 px-5 py-2 rounded-xl text-sm font-semibold transition-colors";
    const inactiveClass = "text-slate-700 hover:bg-slate-300/30 border border-transparent px-5 py-2 rounded-xl text-sm font-medium transition-colors";

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Navbar */}
            <header className="bg-white sticky top-0 z-50 pt-4 pb-4">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* BARIS 1: Logo & Akun */}
                    <div className="flex justify-between items-center mb-6">
                        {/* Kiri: Logo */}
                        <div className="flex items-center gap-3">
                            <Image
                                src="/Logo Vektor.png"
                                width={40}
                                height={40}
                                alt="gambar logo"
                                className="object-contain"
                            />
                            <h1 className="text-black font-extrabold text-2xl tracking-tight">Disparekraf</h1>
                        </div>

                        {/* Kanan: Profil & Logout */}
                        <div className="flex items-center gap-5">
                            <div className="flex items-center gap-3">
                                {/* Nama User */}
                                <span className="text-base font-semibold text-slate-800 hidden sm:block">
                                    {userData?.username || "Wisatawan"}
                                </span>
                                {/* Foto Profil */}
                                <img
                                    src={
                                        userData?.foto ||
                                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                            userData?.username || "User"
                                        )}`
                                    }
                                    alt="Profile"
                                    className="w-10 h-10 rounded-full bg-slate-200 object-cover"
                                />
                            </div>

                            {/* Tombol Logout */}
                            <button
                                onClick={() => setIsLogoutModalOpen(true)}
                                className="text-base font-medium text-red-600 hover:text-red-700 transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    </div>

                    {/* BARIS 2: Navbar Kapsul Abu-abu */}
                    <nav className="hidden md:flex items-center gap-1 justify-between bg-slate-200/70 rounded-2xl px-2 py-2 overflow-x-auto">
                        <Link
                            href="/wisatawan/dashboard"
                            className={pathname.includes("/wisatawan/dashboard") ? activeClass : inactiveClass}
                        >
                            Dashboard
                        </Link>

                        <Link
                            href="/wisatawan/destinasi"
                            className={pathname.includes("/wisatawan/destinasi") ? activeClass : inactiveClass}
                        >
                            Destinasi Wisata
                        </Link>

                        <Link
                            href="/wisatawan/pencarian"
                            className={pathname.includes("/wisatawan/pencarian") ? activeClass : inactiveClass}
                        >
                            Pencarian
                        </Link>

                        <Link
                            href="/wisatawan/hasil-rekomendasi"
                            className={pathname.includes("/wisatawan/hasil-rekomendasi") ? activeClass : inactiveClass}
                        >
                            Hasil Rekomendasi
                        </Link>

                        <Link
                            href="/wisatawan/lokasi-destinasi"
                            className={pathname.includes("/wisatawan/lokasi-destinasi") ? activeClass : inactiveClass}
                        >
                            Lokasi Destinasi
                        </Link>

                        <Link
                            href="/wisatawan/ulasan-rating"
                            className={pathname.includes("/wisatawan/ulasan-rating") ? activeClass : inactiveClass}
                        >
                            Ulasan & Rating
                        </Link>

                        <Link
                            href="/wisatawan/laporan"
                            className={pathname.includes("/wisatawan/laporan") ? activeClass : inactiveClass}
                        >
                            Laporan
                        </Link>
                    </nav>

                </div>
            </header>

            {/* Konten Utama */}
            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
                {children}
            </main>

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