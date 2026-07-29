import { getLanguage } from "./language";

export function withLanguage(url: string) {
    const lang = getLanguage();

    const separator = url.includes("?") ? "&" : "?";

    return `${url}${separator}lang=${lang}`;
}