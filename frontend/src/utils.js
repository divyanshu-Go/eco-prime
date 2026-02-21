// src/utils.js
export const isIpfsUri = (s) => typeof s === "string" && s.startsWith("ipfs://");
export const stripIpfsPrefix = (s) => s && s.startsWith("ipfs://") ? s.slice(7) : s;
