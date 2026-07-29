import id from "@/locales/id";
import en from "@/locales/en";

export function t(language: string) {
    return language === "en"
        ? en
        : id;
}