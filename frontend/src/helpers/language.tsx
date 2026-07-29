export type Language = "id" | "en";

export function getLanguage(): Language {
    if (typeof window === "undefined") {
        return "id";
    }

    const lang = localStorage.getItem("language");

    if (lang === "en") {
        return "en";
    }

    return "id";
}

export function setLanguage(lang: Language) {
    localStorage.setItem("language", lang);

    window.dispatchEvent(
        new Event("languageChanged")
    );
}