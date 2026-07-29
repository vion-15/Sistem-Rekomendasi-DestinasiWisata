"use client";

import { Globe } from "lucide-react";
import { useEffect, useState } from "react";
import {
    getLanguage,
    setLanguage as saveLanguage,
    Language,
} from "@/helpers/language";

export default function LanguageSwitcher() {

    const [language, setCurrentLanguage] = useState<Language>("id");

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
            className="
                flex items-center gap-2 rounded-full border border-slate-200
                bg-white px-3 py-2 shadow-sm
            "
        >
            <Globe
                size={18}
                className="text-slate-500"
            />

            <button
                onClick={() => {
                    saveLanguage("id");
                    setCurrentLanguage("id");
                }}
                className={`
                    rounded-full px-3 py-1 text-sm font-semibold transition-all
                    ${
                        language === "id"
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
                    ${
                        language === "en"
                            ? "bg-blue-600 text-white shadow-sm"
                            : "text-slate-600 hover:bg-slate-200"
                    }
                `}
            >
                EN
            </button>

        </div>
    );
}