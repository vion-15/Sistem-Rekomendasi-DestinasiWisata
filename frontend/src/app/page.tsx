"use client"

import Link from "next/link";
import Image from "next/image";
import HeroSection from "@/components/HeroSectionLandingPage";
import AboutSection from "@/components/AboutSectionLandingPage";
import DestinationSection from "@/components/DestinationSectionLandingPage";
import Footer from "@/components/Footer";
import { Globe, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import {
    getLanguage,
    setLanguage as saveLanguage,
    Language,
} from "@/helpers/language";
import { t } from "@/helpers/translate";

export default function LandingPage() {
    const [language, setCurrentLanguage] = useState<Language>("id");
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const lang = t(language);

    const navLinkStyle =
        "px-1 py-1 text-lg font-semibold text-slate-600 transition-colors duration-200 hover:text-blue-600"

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

    return (
        <div
            className="min-h-screen overflow-x-hidden bg-white font-sans selection:bg-blue-100 
            selection:text-blue-900">
            <header className="max-w-7xl mx-auto pt-6 px-4 sm:px-6 lg:px-8">
                <nav
                    className="
                        flex items-center justify-between rounded-full border border-slate-200/60
                        bg-slate-50/80 px-6 py-4 shadow-sm backdrop-blur-md">
                    <Link
                        href="/"
                        className="
                            flex items-center gap-2 text-slate-900 transition-opacity
                            hover:opacity-80 ">
                        <Image
                            src={"/logo-vektor.png"}
                            width={40}
                            height={48}
                            alt="Logo Disparekraf"
                        />

                        <span className="font-bold text-lg tracking-tight">Disparekraf</span>
                    </Link>

                    <div className="hidden items-center gap-8 md:flex">
                        <Link
                            href="/"
                            className={navLinkStyle}>Home</Link>
                        <Link
                            href="#about"
                            className={navLinkStyle}>About</Link>
                        <Link
                            href="#destinasi"
                            className={navLinkStyle}>Destinasi Wisata</Link>
                    </div>

                    <div className="hidden md:flex items-center gap-5">
                        <div
                            className="
                            flex items-center gap-2 rounded-full border border-slate-200
                            bg-white px-3 py-2 shadow-sm"
                        >
                            <Globe size={18} className="text-slate-500" />

                            <button
                                onClick={() => {
                                    saveLanguage("id");
                                    setCurrentLanguage("id");
                                }}
                                className={`
                                rounded-full px-3 py-1 text-sm font-semibold transition-all
                                ${language === "id"
                                        ? "bg-blue-600 text-white shadow-sm"
                                        : "text-slate-600 hover:bg-slate-200"
                                    }
                                `}
                            >
                                ID
                            </button>

                            <button
                                onClick={() => {
                                    saveLanguage("en");
                                    setCurrentLanguage("en");
                                }}
                                className={`
                                    rounded-full px-3 py-1 text-sm font-semibold transition-all
                                    ${language === "en"
                                        ? "bg-blue-600 text-white shadow-sm"
                                        : "text-slate-600 hover:bg-slate-200"
                                    }
                                `}
                            >
                                EN
                            </button>
                        </div>

                        <Link
                            href="/login"
                            className="
                                px-1 py-1 text-lg font-semibold text-slate-600 transition-colors
                                duration-200 hover:text-blue-600">
                            Login
                        </Link>

                        <Link
                            href="/register"
                            className="
                                px-1 py-1 text-lg font-semibold text-slate-600 
                                transition-colors duration-200 hover:text-blue-600">
                            Register
                        </Link>
                    </div>
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden"
                    >
                        {mobileMenuOpen ? <X size={28} className="text-slate-800" /> : <Menu size={28} className="text-slate-800" />}
                    </button>
                </nav>
                {
                    mobileMenuOpen && (
                        <div className="md:hidden mt-4 rounded-3xl border bg-white shadow-lg p-6">
                            <div className="flex flex-col gap-5">
                                <Link href="/" className={navLinkStyle}>Home</Link>
                                <Link href="#about" className={navLinkStyle}>About</Link>
                                <Link href="#destinasi" className={navLinkStyle}>
                                    Destinasi Wisata
                                </Link>
                                <hr />
                                {/* Language */}
                                <div className="flex items-center gap-3">
                                    <Globe size={18} className="text-slate-500" />
                                    <button
                                        onClick={() => {
                                            saveLanguage("id");
                                            setCurrentLanguage("id");
                                        }}
                                        className={`
                                        rounded-full px-3 py-1 text-sm font-semibold transition-all
                                        ${language === "id"
                                                ? "bg-blue-600 text-white shadow-sm"
                                                : "text-slate-600 hover:bg-slate-200"
                                            }
                                        `}
                                    >
                                        ID
                                    </button>

                                    <button
                                        onClick={() => {
                                            saveLanguage("en");
                                            setCurrentLanguage("en");
                                        }}
                                        className={`
                                        rounded-full px-3 py-1 text-sm font-semibold transition-all
                                        ${language === "en"
                                                ? "bg-blue-600 text-white shadow-sm"
                                                : "text-slate-600 hover:bg-slate-200"
                                            }
                                        `}
                                    >
                                        EN
                                    </button>
                                </div>
                                <hr />
                                <Link href="/login"  className="
                                px-1 py-1 text-lg font-semibold text-slate-600 
                                transition-colors duration-200 hover:text-blue-600">
                                    Login
                                </Link>
                                <Link href="/register"  className="
                                px-1 py-1 text-lg font-semibold text-slate-600 
                                transition-colors duration-200 hover:text-blue-600">
                                    Register
                                </Link>
                            </div>
                        </div>
                    )}
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
                <section className="py-15">
                    <HeroSection lang={lang} />
                    <AboutSection lang={lang} />
                    <DestinationSection
                        lang={lang}
                        language={language}
                    />
                </section>
            </main>

            <Footer lang={lang} />
        </div>
    );
}