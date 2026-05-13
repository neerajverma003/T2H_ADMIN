export const getCdnUrl = (key) => {
    if (!key) return "";
    if (key.startsWith("http")) return key;
    
    const cdnBase = import.meta.env.VITE_CDN_URL?.trim() || "https://media.trip2honeymoon.com";
    const cleanKey = key.replace(/^\/+/, "");
    
    return `${cdnBase}/${cleanKey}`;
};
