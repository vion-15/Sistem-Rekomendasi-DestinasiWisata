"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";

import { getLanguage, Language } from "@/helpers/language";
import { t } from "@/helpers/translate";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function ResetPasswordPage() {

    const router = useRouter();
    const searchParams = useSearchParams();

    const email = searchParams.get("email");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const [language, setCurrentLanguage] =
        useState<Language>("id");

    const lang = t(language);

    useEffect(() => {

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCurrentLanguage(getLanguage());

        const handleLanguageChange = () => {
            setCurrentLanguage(getLanguage());
        };

        window.addEventListener("languageChanged", handleLanguageChange);

        return () => {
            window.removeEventListener("languageChanged", handleLanguageChange);
        };

    }, []);

    const handleSubmit = async (e: FormEvent) => {

        e.preventDefault();

        setErrorMsg("");
        setSuccessMsg("");

        if (!email) {
            setErrorMsg("Email tidak ditemukan.");
            return;
        }

        setIsLoading(true);

        try {

            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/auth/reset-password?email=${encodeURIComponent(email)}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        password,
                        confirm_password: confirmPassword,
                    }),
                }
            );

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error);
            }

            setSuccessMsg(data.message);

            setTimeout(() => {
                router.push("/login");
            }, 2000);

        } catch (err: unknown) {

            if (err instanceof Error) {
                setErrorMsg(err.message);
            } else {
                setErrorMsg("Terjadi kesalahan.");
            }

        } finally {
            setIsLoading(false);
        }

    };

    return (

        <div
            className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat relative"
            style={{
                backgroundImage:
                    "url('/images/foto-bg-login-register.jpg')",
            }}
        >

            <div className="absolute inset-0 bg-slate-900/40"></div>

            <div className="absolute top-5 right-5 flex items-center gap-3">

                <Link href="/login">
                    <ArrowLeft className="bg-blue-700 rounded-sm" />
                </Link>

                <LanguageSwitcher />

            </div>

            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md relative z-10">

                <div className="text-center mb-8">

                    <h1 className="text-3xl font-extrabold text-slate-800">
                        {lang.resetPwTitle}
                    </h1>

                    <p className="text-slate-500 mt-2 text-sm">
                        {lang.resetPwDesc}
                    </p>

                </div>

                {errorMsg && (
                    <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-100 text-red-700 text-sm">
                        {errorMsg}
                    </div>
                )}

                {successMsg && (
                    <div className="mb-5 p-3 rounded-lg bg-green-50 border border-green-100 text-green-700 text-sm">
                        {successMsg}
                    </div>
                )}

                <form
                    onSubmit={handleSubmit}
                    className="space-y-5"
                >

                    <div className="relative">

                        <label className="block text-sm font-semibold mb-1.5 text-slate-800">
                            {lang.newPwLabel}
                        </label>

                        <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl 
                            focus:ring-2 focus:ring-blue-500 outline-none text-slate-800"
                        />

                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-10"
                        >
                            {showPassword ? <EyeOff size={20} className="text-slate-800" /> : <Eye size={20} className="text-slate-800" />}
                        </button>

                    </div>

                    <div className="relative">

                        <label className="block text-sm font-semibold mb-1.5 text-slate-800">
                            {lang.confirmPw}
                        </label>

                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 
                            focus:ring-blue-500 outline-none text-slate-800"
                        />

                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-10"
                        >
                            {showConfirmPassword ? <EyeOff size={20} className="text-slate-800" /> : <Eye size={20} className="text-slate-800" />}
                        </button>

                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full py-3 rounded-xl text-white font-bold transition
                        ${isLoading
                                ? "bg-blue-400 cursor-not-allowed"
                                : "bg-blue-600 hover:bg-blue-700"
                            }`}
                    >
                        {isLoading
                            ? lang.savingNewPw
                            : lang.savePw}
                    </button>

                </form>

            </div>

        </div>

    );

}