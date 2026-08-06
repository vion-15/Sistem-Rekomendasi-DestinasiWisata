"use client";

import { useState, FormEvent, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { getLanguage, Language } from "@/helpers/language";
import { t } from "@/helpers/translate";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function ForgotPasswordPage() {

    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

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
        setIsLoading(true);

        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/auth/forgot-password`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email,
                    }),
                }
            );

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error);
            }

            setSuccessMsg(data.message);

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
                    "url('/frontend-images/foto-bg-login-register.jpg')",
            }}
        >
            <div className="absolute inset-0 bg-slate-900/40 z-0"></div>

            <div className="absolute top-5 right-5 flex items-center gap-3">
                <Link href="/login">
                    <ArrowLeft className="bg-blue-700 rounded-sm" />
                </Link>

                <LanguageSwitcher />
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-100 relative z-10">

                <div className="text-center mb-8">

                    <h1 className="text-3xl font-extrabold text-slate-800">
                        {lang.forgetPassword}
                    </h1>

                    <p className="text-slate-500 text-sm mt-2">
                        {lang.pwDescription}
                    </p>

                </div>

                {errorMsg && (
                    <div className="mb-5 p-3 bg-red-50 text-red-700 rounded-lg border border-red-100 text-sm">
                        {errorMsg}
                    </div>
                )}

                {successMsg && (
                    <div className="mb-5 p-3 bg-green-50 text-green-700 rounded-lg border border-green-100 text-sm">
                        {successMsg}
                    </div>
                )}

                <form
                    onSubmit={handleSubmit}
                    className="space-y-5"
                >

                    <div>

                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                            Email
                        </label>

                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder={lang.emailResetPlaceholder}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 
                            focus:ring-blue-500 outline-none text-slate-800"
                        />

                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full py-3 rounded-xl font-bold text-white transition
                            ${
                                isLoading
                                    ? "bg-blue-400 cursor-not-allowed"
                                    : "bg-blue-600 hover:bg-blue-700"
                            }`}
                    >
                        {isLoading
                            ? lang.sendingLink
                            : lang.sendLink}
                    </button>

                </form>

                <div className="mt-6 text-center">

                    <Link
                        href="/login"
                        className="text-blue-600 hover:underline text-sm"
                    >
                        {lang.backLogin}
                    </Link>

                </div>

            </div>
        </div>
    );
}