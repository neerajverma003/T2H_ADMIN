export const getCdnUrl = (key) => {
    if (!key) return "";
    if (typeof key !== "string") return "";
    const trimmed = key.trim();
    if (
        trimmed.startsWith("http://") ||
        trimmed.startsWith("https://") ||
        trimmed.startsWith("data:") ||
        trimmed.startsWith("blob:")
    ) {
        return trimmed;
    }

    const cdnBase = import.meta.env.VITE_CDN_URL?.trim() || "https://media.trip2honeymoon.com";
    const cleanKey = trimmed.replace(/^\/+/, "");

    return `${cdnBase}/${encodeURI(cleanKey)}`;
};
