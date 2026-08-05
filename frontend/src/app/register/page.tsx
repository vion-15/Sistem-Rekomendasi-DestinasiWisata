"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle, CheckCircle, Eye, EyeOff } from "lucide-react";
import { getLanguage, Language } from "@/helpers/language";
import { t } from "@/helpers/translate";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function RegisterWisatawanPage() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const [showPassword, setShowPassword] = useState(false);
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

        const formData = new FormData();
        formData.append("username", username);
        formData.append("email", email);
        formData.append("password", password);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
                method: "POST",
                body: formData,
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || lang.registerFailed);
            }

            setSuccessMsg(data.message || lang.registerSuccess);

            setTimeout(() => {
                router.push("/login");
            }, 2000);

        } catch (err: unknown) {
            if (err instanceof Error) {
                setErrorMsg(err.message);
            } else {
                setErrorMsg(lang.systemError);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen bg-gray-100 flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat relative"
            style={{ backgroundImage: "url('/image/foto-bg-login-register.jpg')" }}
        >

            <div className="absolute top-5 right-5">
                <LanguageSwitcher />
            </div>

            <div className="mt-16 sm:mt-8 md:mt-0 bg-white p-6 md:p-8 border border-slate-200 rounded-xl shadow-xl shadow-slate-900/5 w-full max-w-md">
                <h1 className="text-2xl font-bold text-slate-800 text-center mb-2">{lang.registerTitle}</h1>
                <p className="text-slate-500 text-sm text-center mb-8">{lang.registerSubtitle}</p>

                {errorMsg && (
                    <div className="mb-4 px-4 py-3 border border-red-200 bg-red-50 text-red-700 rounded-xl text-sm">
                        <AlertCircle size={18} />
                        <span>{errorMsg}</span>
                    </div>
                )}

                {successMsg && (
                    <div className="mb-4 px-4 py-3 border border-green-200 bg-green-50 text-green-700 rounded-xl text-sm">
                        <CheckCircle size={18} />
                        <span>{successMsg}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label
                            htmlFor="username"
                            className="block text-sm font-medium text-slate-700 mb-2">{lang.usernameRegister}</label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder={lang.usernamePlaceholderRegister}
                            required
                            className="w-full px-4 py-3 border border-slate-300 rounded-xl 
                            text-slate-900 placeholder:text-slate-400 focus:ring-2 
                            focus:ring-blue-500 outline-none transition-all duration-200 focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium text-slate-700 mb-2">{lang.email}</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder={lang.emailPlaceholder}
                            className="
                                w-full px-4 py-3 border border-slate-300 rounded-xl 
                                text-slate-900 placeholder:text-slate-400 focus:ring-2 
                                focus:ring-blue-500 outline-none transition-all duration-200 focus:border-blue-500
                            "
                        />
                    </div>

                    <div className="relative">
                        <label
                            htmlFor="password"
                            className="mb-2 block text-sm font-medium text-slate-700">{lang.password}</label>
                        <input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder={lang.passwordPlaceholder}
                            className="
                                w-full rounded-xl border border-slate-300 px-4 py-3 pr-12 
                                text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-200 
                                focus:border-blue-500 focus:ring-2 focus:ring-blue-500
                            "
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="
                                absolute right-3 top-[70%] -translate-y-1/2 text-slate-500 transition-colors duration-200
                                hover:text-slate-700
                            "
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
                        className={`
                            w-full rounded-xl px-4 py-3 font-semibold text-white transition-all duration-300 ${isLoading
                                ? "cursor-not-allowed bg-blue-400"
                                : "cursor-pointer bg-blue-600 shadow-lg shadow-blue-600/20 hover:bg-blue-700"
                            }`}
                    >
                        {isLoading
                            ? lang.processing
                            : lang.registerNow}
                    </button>
                </form>

                <div className="mt-6 text-center text-slate-600">
                    {lang.alreadyHaveAccount}{" "}
                    <Link
                        href="/login"
                        className="font-semibold text-blue-600 transition-colors duration-200 hover:text-blue-700">
                        {lang.loginHere}
                    </Link>
                </div>
            </div>
        </div>
    );
}