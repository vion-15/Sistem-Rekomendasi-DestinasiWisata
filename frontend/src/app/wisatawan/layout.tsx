"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { LogOut } from "lucide-react";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import {
    getLanguage,
    Language,
} from "@/helpers/language";
import { t } from "@/helpers/translate";

type UserData = {
    id: string;
    username: string;
    email: string;
    alamat: string;
    foto?: string;
};

export default function WisatawanLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const [userData, setUserData] = useState<UserData | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [alamat, setAlamat] = useState("");
    const [password, setPassword] = useState("");
    const [foto, setFoto] = useState<File | null>(null);
    const [errorMsg, setErrorMsg] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [language, setCurrentLanguage] =
        useState<Language>("id");

    const lang = t(language);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("user_role");
        const rawData = localStorage.getItem("user_data");

        if (!token || role !== "wisatawan" || !rawData) {
            router.replace("/login");
            return;
        }

        try {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setUserData(JSON.parse(rawData));
            setIsLoaded(true);
        } catch (error) {
            console.error(lang.invalidUserData, error);
            router.replace("/login");
        }
    }, [router]);

    const getProfile = async () => {
        try {
            const userData = JSON.parse(localStorage.getItem("user_data") || "{}");
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/wisatawan/${userData?.id}`
            );
            const result = await response.json();
            return result.data;
        } catch (error) {
            console.error(lang.profileLoadFailed, error);
            return null;
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setErrorMsg("");
        setIsLoading(true);
        const formData = new FormData();
        formData.append("username", username);
        formData.append("email", email);
        formData.append("alamat", alamat);
        if (password) formData.append("password", password);
        if (foto) formData.append("foto", foto);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/wisatawan/${userData?.id}`, {
                method: "PUT",
                body: formData,
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || lang.saveFailed);
            setIsProfileModalOpen(false);
            const updatedProfile = await getProfile();
            if (updatedProfile) {
                localStorage.setItem(
                    "user_data",
                    JSON.stringify(updatedProfile)
                );
                setUserData(updatedProfile);
                window.dispatchEvent(new Event("user-updated"));
            }
            setIsProfileModalOpen(false);
        } catch (err: unknown) {
            if (err instanceof Error) {
                setErrorMsg(err.message);
            } else {
                setErrorMsg(lang.unknownError);
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCurrentLanguage(getLanguage());

        const handleLanguageChange = () => {
            setCurrentLanguage(getLanguage());
        };

        window.addEventListener(
            "languageChanged",
            handleLanguageChange
        );

        return () => {
            window.removeEventListener(
                "languageChanged",
                handleLanguageChange
            );
        };
    }, []);

    const handleDeleteAccount = async () => {
        const confirmDelete = confirm(
            "Apakah Anda yakin ingin menghapus akun ini?\n\nSemua data pencarian, lokasi destinasi, dan ulasan Anda akan ikut terhapus."
        );

        if (!confirmDelete) return;

        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/wisatawan/${userData?.id}`,
                {
                    method: "DELETE",
                }
            );

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Gagal menghapus akun");
            }

            localStorage.removeItem("token");
            localStorage.removeItem("user_role");
            localStorage.removeItem("user_data");

            alert("Akun berhasil dihapus.");

            router.push("/login");
        } catch (err) {
            if (err instanceof Error) {
                alert(err.message);
            } else {
                alert("Terjadi kesalahan.");
            }
        }
    };

    const executeLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user_role");
        localStorage.removeItem("user_data");
        router.push("/login");
    };

    if (!isLoaded) return null;

    const activeClass = "text-slate-800 bg-slate-300/50 border border-slate-400/30 px-5 py-2 rounded-xl text-sm font-semibold transition-colors";
    const inactiveClass = "text-slate-700 hover:bg-slate-300/30 border border-transparent px-5 py-2 rounded-xl text-sm font-medium transition-colors";

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <header className="bg-white sticky top-0 z-50 pt-4 pb-4">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                            <Image
                                src="/logo-vektor.png"
                                width={40}
                                height={40}
                                alt="gambar logo"
                                className="object-contain"
                            />
                            <h1 className="text-black font-extrabold text-2xl tracking-tight">Disparekraf</h1>
                        </div>

                        <div className="flex items-center gap-5">
                            <div className="flex items-center gap-3">
                                <LanguageSwitcher />
                                <span className="text-base font-semibold text-slate-800 hidden sm:block">
                                    {userData?.username || "Wisatawan"}
                                </span>
                                <button
                                    onClick={() => {
                                        setUsername(userData?.username || "");
                                        setEmail(userData?.email || "");
                                        setAlamat(userData?.alamat || "");
                                        setPassword("");
                                        setFoto(null);
                                        setErrorMsg("");
                                        setIsProfileModalOpen(true);
                                    }}
                                >
                                    <Image
                                        src={
                                            userData?.foto ||
                                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                                userData?.username || "User"
                                            )}`
                                        }
                                        alt="Profile"
                                        width={40}
                                        height={40}
                                        className="w-10 h-10 rounded-full object-cover hover:ring-2 hover:ring-blue-500 transition"
                                    />
                                </button>
                            </div>

                            <button
                                onClick={() => setIsLogoutModalOpen(true)}
                                className="text-base font-medium text-red-600 hover:text-red-700 transition-colors"
                            >
                                {lang.logout}
                            </button>
                        </div>
                    </div>
                    <nav className="hidden md:flex items-center gap-1 justify-between bg-slate-200/70 rounded-2xl px-2 py-2 overflow-x-auto">
                        <Link
                            href="/wisatawan/dashboard"
                            className={pathname.includes("/wisatawan/dashboard") ? activeClass : inactiveClass}
                        >
                            {lang.dashboard}
                        </Link>
                        <Link
                            href="/wisatawan/destinasi"
                            className={pathname.includes("/wisatawan/destinasi") ? activeClass : inactiveClass}
                        >
                            {lang.destination}
                        </Link>
                        <Link
                            href="/wisatawan/pencarian"
                            className={pathname.includes("/wisatawan/pencarian") ? activeClass : inactiveClass}
                        >
                            {lang.search}
                        </Link>
                        <Link
                            href="/wisatawan/hasil-rekomendasi"
                            className={pathname.includes("/wisatawan/hasil-rekomendasi") ? activeClass : inactiveClass}
                        >
                            {lang.recommendation}
                        </Link>
                        <Link
                            href="/wisatawan/lokasi-destinasi"
                            className={pathname.includes("/wisatawan/lokasi-destinasi") ? activeClass : inactiveClass}
                        >
                            {lang.location}
                        </Link>
                        <Link
                            href="/wisatawan/ulasan-rating"
                            className={pathname.includes("/wisatawan/ulasan-rating") ? activeClass : inactiveClass}
                        >
                            {lang.review}
                        </Link>
                        <Link
                            href="/wisatawan/laporan"
                            className={pathname.includes("/wisatawan/laporan") ? activeClass : inactiveClass}
                        >
                            {lang.report}
                        </Link>
                    </nav>
                </div>
            </header>

            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
                {children}
            </main>

            {isLogoutModalOpen && (
                <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white p-6 rounded-2xl w-full max-w-sm shadow-2xl text-center relative">

                        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <LogOut />
                        </div>

                        <h2 className="text-xl font-bold text-gray-800 mb-10">{lang.logoutConfirmTitle}</h2>
                        <div className="flex justify-center gap-3">
                            <button
                                onClick={executeLogout}
                                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold 
                                transition-colors"
                            >
                                {lang.logout}
                            </button>

                            <button
                                onClick={() => setIsLogoutModalOpen(false)}
                                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl 
                                font-semibold transition-colors"
                            >
                                {lang.cancel}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isProfileModalOpen && (
                <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-2xl">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">
                            {lang.editProfile}
                        </h2>

                        {errorMsg && (
                            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm border border-red-200">
                                {errorMsg}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {lang.username}
                                </label>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 
                                    focus:ring-blue-500 outline-none text-slate-800 placeholder:text-slate-400"
                                    placeholder={lang.usernamePlaceholder}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {lang.email}
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 
                                    focus:ring-blue-500 outline-none text-slate-800 placeholder:text-slate-400"
                                    placeholder="wisatawan@wisata.com"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {lang.address}
                                </label>

                                <textarea
                                    value={alamat}
                                    onChange={(e) => setAlamat(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-slate-800"
                                    rows={3}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {lang.password}
                                    <span className="text-gray-400 font-normal">
                                        {" "}
                                        ({lang.passwordOptional})
                                    </span>
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 
                                    focus:ring-blue-500 outline-none text-slate-800 placeholder:text-slate-400"
                                    placeholder="••••••••"
                                    required={false}
                                />
                            </div>
                            <div>
                                <label className="text-slate-800">
                                    {lang.profilePhoto}
                                    <span className="text-gray-400 font-normal">
                                        {" "}
                                        ({lang.optional})
                                    </span>
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setFoto(e.target.files ? e.target.files[0] : null)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 
                                    focus:ring-blue-500 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full 
                                    file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 
                                    hover:file:bg-blue-100 transition-all text-slate-800 placeholder:text-slate-400"
                                    required={false}
                                />
                            </div>

                            <div className="flex justify-between gap-3 mt-6 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={handleDeleteAccount}
                                    className="px-4 py-2 bg-red-100 text-red-600 rounded-lg
                                    hover:bg-red-600 hover:text-white transition"
                                >
                                    {lang.deleteAccount}
                                </button>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsProfileModalOpen(false)}
                                        className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg 
                                    font-medium transition-colors"
                                    >
                                        {lang.cancel}
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className={`px-4 py-2 text-white rounded-lg font-medium transition-colors 
                                        ${isLoading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                                            }`}
                                    >
                                        {isLoading
                                            ? lang.saving
                                            : lang.save}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}